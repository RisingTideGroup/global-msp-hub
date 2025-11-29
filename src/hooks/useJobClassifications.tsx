
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface JobClassification {
  id: string;
  job_id: string;
  classification_type: string;
  classification_value: string;
  created_at: string;
  updated_at: string;
}

export const useJobClassifications = (jobId?: string) => {
  return useQuery({
    queryKey: ['job-classifications', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('job_id', jobId);

      if (error) throw error;
      return data as JobClassification[];
    },
    enabled: !!jobId
  });
};

export const useSaveJobClassifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, classifications }: { 
      jobId: string; 
      classifications: Record<string, string> 
    }) => {
      console.log('Saving job classifications:', { jobId, classifications });
      
      // First, delete existing classifications for this job
      const { error: deleteError } = await supabase
        .from('job_classifications')
        .delete()
        .eq('job_id', jobId);

      if (deleteError) throw deleteError;

      // Then insert new classifications (only non-empty values)
      const classificationsToInsert = Object.entries(classifications)
        .filter(([_, value]) => value && value.trim())
        .map(([type, value]) => ({
          job_id: jobId,
          classification_type: type,
          classification_value: value
        }));

      if (classificationsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('job_classifications')
          .insert(classificationsToInsert);

        if (insertError) throw insertError;
      }

      return classificationsToInsert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-classifications', variables.jobId] });
      console.log('Job classifications saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save job classifications:', error);
      toast({
        title: "Error",
        description: "Failed to save job classification data",
        variant: "destructive"
      });
    }
  });
};
