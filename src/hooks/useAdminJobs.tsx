
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseJob } from "@/types/shared";
import { useDeleteEntity, useToggleEntityBoolean } from "@/hooks/useSharedMutations";

export interface AdminJob extends BaseJob {
  business: {
    id: string;
    name: string;
    status: string;
  };
  job_classifications?: Array<{
    classification_type: string;
    classification_value: string;
  }>;
}

export const useAdminJobs = () => {
  return useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses (
            id,
            name,
            status
          ),
          job_classifications (
            classification_type,
            classification_value
          )
        `)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      return data as AdminJob[];
    }
  });
};

export const useToggleJobStatus = () => {
  return useToggleEntityBoolean(
    'jobs',
    'is_active',
    'Job',
    ['admin-jobs', 'jobs']
  );
};

export const useDeleteJob = () => {
  return useDeleteEntity(
    'jobs',
    'Job',
    ['admin-jobs', 'jobs']
  );
};
