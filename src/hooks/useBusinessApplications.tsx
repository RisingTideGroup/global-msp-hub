import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface BusinessApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter: string | null;
  phone: string | null;
  resume_url: string | null;
  applied_at: string;
  updated_at: string;
  scan_status: 'pending' | 'clean' | 'malicious' | 'error';
  malware_detected: boolean;
  scan_error_message: string | null;
  job: {
    id: string;
    title: string;
    location: string;
  };
  applicant: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export const useBusinessApplications = (businessId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['business-applications', businessId],
    queryFn: async () => {
      if (!user || !businessId) return [];
      
      // Fetch applications with job and applicant details
      const { data: applicationsData, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs!inner (
            id,
            title,
            location,
            business_id
          )
        `)
        .eq('job.business_id', businessId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching business applications:', error);
        throw error;
      }

      // Fetch applicant profiles separately
      const userIds = applicationsData?.map(app => app.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      // Merge the data
      const applicationsWithProfiles = applicationsData?.map(app => ({
        ...app,
        applicant: profilesData?.find(p => p.id === app.user_id) || {
          id: app.user_id,
          email: null,
          first_name: null,
          last_name: null
        }
      })) || [];

      return applicationsWithProfiles as BusinessApplication[];
    },
    enabled: !!user && !!businessId
  });
};

export const useUpdateApplicationStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status 
    }: { 
      applicationId: string; 
      status: 'pending' | 'reviewed' | 'accepted' | 'rejected' 
    }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: async (_, { applicationId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['business-applications'] });
      
      // Send notification to applicant
      try {
        const siteUrl = window.location.origin;
        
        // Get application details
        const { data: appData, error: appError } = await supabase
          .from('job_applications')
          .select('user_id, job:jobs(id, title, business:businesses(name))')
          .eq('id', applicationId)
          .single();

        if (!appError && appData) {
          // Get applicant profile separately
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', appData.user_id)
            .single();

          const notificationTypeMap: Record<string, string> = {
            'accepted': 'application_accepted',
            'rejected': 'application_rejected',
            'reviewed': 'application_reviewed'
          };

          await supabase.functions.invoke('process-notification', {
            body: {
              notificationType: notificationTypeMap[status] || 'application_reviewed',
              recipientUserId: appData.user_id,
              context: {
                applicant_name: `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 'there',
                job_title: appData.job?.title || 'Unknown Position',
                business_name: appData.job?.business?.name || 'Unknown Company',
                job_link: `${siteUrl}/job/${appData.job?.id}`
              }
            }
          });
        }
      } catch (notifError) {
        console.error('Failed to send status notification:', notifError);
      }
      
      toast({
        title: "Status updated",
        description: "Application status has been updated and the applicant has been notified."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive"
      });
      console.error('Update status error:', error);
    }
  });
};