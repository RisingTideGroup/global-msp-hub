
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface BusinessWizardProgress {
  id: string;
  business_id: string;
  current_step: number;
  completed_steps: number[];
  wizard_data: any;
  created_at: string;
  updated_at: string;
}

export const useBusinessWizardProgress = (businessId?: string) => {
  return useQuery({
    queryKey: ['business-wizard-progress', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('business_wizard_progress')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as BusinessWizardProgress | null;
    },
    enabled: !!businessId
  });
};

export const useUpdateWizardProgress = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, step, data, markCompleted }: {
      businessId: string;
      step: number;
      data: any;
      markCompleted?: boolean;
    }) => {
      const { data: existing } = await supabase
        .from('business_wizard_progress')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      const currentCompletedSteps = existing?.completed_steps || [];
      const updatedCompletedSteps = markCompleted && !currentCompletedSteps.includes(step)
        ? [...currentCompletedSteps, step]
        : currentCompletedSteps;

      // Ensure we have valid objects for merging
      const existingWizardData = (existing?.wizard_data && typeof existing.wizard_data === 'object' && !Array.isArray(existing.wizard_data)) 
        ? existing.wizard_data 
        : {};
      
      // Safe object merging with explicit type checking
      let wizardData = existingWizardData;
      
      if (data && typeof data === 'object' && data !== null && !Array.isArray(data) && data.constructor === Object) {
        wizardData = { ...existingWizardData, ...data };
      }
      
      const payload = {
        business_id: businessId,
        current_step: step,
        completed_steps: updatedCompletedSteps,
        wizard_data: wizardData
      };

      if (existing) {
        const { data: result, error } = await supabase
          .from('business_wizard_progress')
          .update(payload)
          .eq('business_id', businessId)
          .select()
          .maybeSingle();
        
        if (error || !result) throw error || new Error('Failed to update progress');
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('business_wizard_progress')
          .insert(payload)
          .select()
          .maybeSingle();
        
        if (error || !result) throw error || new Error('Failed to create progress');
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-wizard-progress'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
      console.error('Wizard progress error:', error);
    }
  });
};

// Export the main hook that was missing
export const useBusinessWizard = (businessId?: string) => {
  const progress = useBusinessWizardProgress(businessId);
  const updateProgress = useUpdateWizardProgress();

  return {
    data: progress.data,
    isPending: progress.isPending,
    saveProgress: (businessId: string, step: number, completedSteps: number[], data: any) => {
      updateProgress.mutate({ businessId, step, data, markCompleted: false });
    }
  };
};
