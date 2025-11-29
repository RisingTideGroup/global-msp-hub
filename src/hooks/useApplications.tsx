
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string | null;
  phone: string | null;
  resume_url: string | null;
  applied_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('job_applications' as any)
        .select(`
          *,
          job:jobs (
            id,
            title,
            business:businesses (name)
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user
  });
};

export const useCheckExistingApplication = (jobId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['application-check', jobId, user?.id],
    queryFn: async () => {
      if (!user || !jobId) return null;
      
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking application:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!jobId
  });
};

export const useCancelApplication = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) throw error;
      return applicationId;
    },
    onSuccess: (applicationId) => {
      // Manually update cache for all application-check queries
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === 'application-check' },
        null
      );
      
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'application-check'
      });
      
      toast({
        title: "Application cancelled",
        description: "Your application has been withdrawn."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel application",
        variant: "destructive"
      });
    }
  });
};

export const useApplyToJob = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      jobId, 
      coverLetter, 
      phone, 
      resumeUrl 
    }: { 
      jobId: string; 
      coverLetter: string; 
      phone: string; 
      resumeUrl?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: jobId,
          cover_letter: coverLetter,
          phone: phone,
          resume_url: resumeUrl,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Trigger background scan if resume was uploaded
      if (resumeUrl) {
        try {
          await supabase.functions.invoke('scan-application-resume', {
            body: {
              applicationId: data.id,
              resumeUrl: resumeUrl,
              fileName: resumeUrl.split('/').pop() || 'resume'
            }
          });
          console.log('Background malware scan initiated');
        } catch (scanError) {
          console.error('Failed to initiate background scan:', scanError);
          // Don't fail the application if scan initiation fails
        }
      }
      
      // Send notification email to business owner
      try {
        const siteUrl = window.location.origin;
        
        // Get job details to find business_id
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('business_id, title')
          .eq('id', jobId)
          .single();
        
        if (!jobError && jobData) {
          // Get business owner details
          const { data: businessData, error: businessError } = await supabase
            .from('businesses')
            .select('name, owner_id, profiles:owner_id(first_name, last_name)')
            .eq('id', jobData.business_id)
            .single();
          
          if (!businessError && businessData) {
            await supabase.functions.invoke('process-notification', {
              body: {
                notificationType: 'new_application',
                recipientUserId: businessData.owner_id,
                context: {
                  applicant_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
                  applicant_email: user.email,
                  job_title: jobData.title || 'Unknown Position',
                  business_name: businessData.name,
                  dashboard_link: `${siteUrl}/business?tab=applications`,
                  applied_date: new Date().toLocaleDateString()
                }
              }
            });
          }
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the whole operation if notification fails
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      // Invalidate all application-check queries regardless of jobId
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'application-check'
      });
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
      console.error('Application error:', error);
    }
  });
};
