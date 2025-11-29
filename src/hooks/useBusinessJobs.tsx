import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BaseJob } from "@/types/shared";
import { useDeleteEntity } from "@/hooks/useSharedMutations";

export interface BusinessJobsJob extends BaseJob {
  business: {
    id: string;
    name: string;
    owner_id: string;
    description: string | null;
    description_rich: string | null;
    culture: string | null;
    culture_rich: string | null;
    values: string[] | null;
    industry: string | null;
    location: string | null;
  };
}

export const useBusinessJobs = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['business-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses!inner (
            id,
            name,
            owner_id,
            description,
            description_rich,
            culture,
            culture_rich,
            values,
            industry,
            location
          )
        `)
        .eq('business.owner_id', user.id);

      if (error) throw error;
      return data as BusinessJobsJob[];
    },
    enabled: !!user
  });
};

export const useCreateJob = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: {
      title: string;
      description: string;
      requirements?: string;
      location: string;
      job_type: string;
      work_arrangement: string;
      salary_min?: number;
      salary_max?: number;
      benefits?: string;
      business_id: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Failed to create job');
      return data;
    },
    onSuccess: async (jobData) => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      // Send admin notification about new job posted
      try {
        const siteUrl = window.location.origin;
        
        // Get business details
        const { data: business } = await supabase
          .from('businesses')
          .select('name')
          .eq('id', jobData.business_id)
          .single();
        
        await supabase.functions.invoke('process-notification', {
          body: {
            notificationType: 'new_job_posted',
            recipientUserId: null,
            recipientEmail: 'admin@example.com',
            context: {
              job_title: jobData.title,
              business_name: business?.name || 'Unknown Business',
              location: jobData.location,
              job_link: `${siteUrl}/job/${jobData.id}`
            }
          }
        });
      } catch (error) {
        console.error('Failed to send new job notification:', error);
      }

      // Notify all subscribers of this business
      try {
        const siteUrl = window.location.origin;
        
        // Get business details
        const { data: business } = await supabase
          .from('businesses')
          .select('name, logo_url')
          .eq('id', jobData.business_id)
          .single();

        // Get all subscribers for this business
        const { data: subscriptions } = await supabase
          .from('business_subscriptions')
          .select(`
            user_id,
            profiles:user_id (email)
          `)
          .eq('business_id', jobData.business_id);

        if (subscriptions && subscriptions.length > 0) {
          // Truncate description for email
          const jobDescription = jobData.description || '';
          const truncatedDescription = jobDescription.length > 200 
            ? jobDescription.substring(0, 200) + '...' 
            : jobDescription;

          // Send notification to each subscriber using existing notification system
          const notificationPromises = subscriptions.map((sub: any) => {
            if (!sub.profiles?.email) return Promise.resolve();
            
            return supabase.functions.invoke('process-notification', {
              body: {
                notificationTypeKey: 'company_new_job',
                recipientEmail: sub.profiles.email,
                recipientUserId: sub.user_id,
                context: {
                  company_name: business?.name || 'Unknown Company',
                  job_title: jobData.title,
                  job_location: jobData.location,
                  job_type: jobData.job_type,
                  job_description: truncatedDescription,
                  job_url: `${siteUrl}/job/${jobData.id}`
                }
              }
            });
          });

          await Promise.all(notificationPromises);
          console.log(`Notified ${subscriptions.length} subscribers about new job`);
        }
      } catch (error) {
        console.error('Failed to notify job subscribers:', error);
      }
      
      toast({
        title: "Job posted successfully!",
        description: "Your job posting is now live and subscribers will be notified."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive"
      });
      console.error('Job creation error:', error);
    }
  });
};

export const useUpdateJob = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: {
      id: string;
      title: string;
      description: string;
      requirements?: string;
      location: string;
      job_type: string;
      work_arrangement: string;
      salary_min?: number;
      salary_max?: number;
      benefits?: string;
      is_active: boolean;
    }) => {
      const { id, ...updateData } = jobData;
      
      const { data, error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Job not found');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job posting",
        variant: "destructive"
      });
      console.error('Job update error:', error);
    }
  });
};

export const useDeleteJob = () => {
  return useDeleteEntity(
    'jobs',
    'Job',
    ['business-jobs', 'jobs']
  );
};
