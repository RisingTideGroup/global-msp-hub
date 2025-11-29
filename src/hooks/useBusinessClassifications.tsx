
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BusinessClassification {
  id: string;
  business_id: string;
  classification_type: string;
  classification_value: string;
  created_at: string;
  updated_at: string;
}

export const useBusinessClassifications = (businessId?: string) => {
  return useQuery({
    queryKey: ['business-classifications', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('business_classifications')
        .select('*')
        .eq('business_id', businessId);

      if (error) throw error;
      return data as BusinessClassification[];
    },
    enabled: !!businessId
  });
};

export const useSaveBusinessClassifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, classifications }: { 
      businessId: string; 
      classifications: Record<string, string> 
    }) => {
      console.log('Saving business classifications:', { businessId, classifications });
      
      // First, delete existing classifications for this business
      const { error: deleteError } = await supabase
        .from('business_classifications')
        .delete()
        .eq('business_id', businessId);

      if (deleteError) throw deleteError;

      // Then insert new classifications (only non-empty values)
      const classificationsToInsert = Object.entries(classifications)
        .filter(([_, value]) => value && value.trim())
        .map(([type, value]) => ({
          business_id: businessId,
          classification_type: type,
          classification_value: value
        }));

      if (classificationsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('business_classifications')
          .insert(classificationsToInsert);

        if (insertError) throw insertError;
      }

      return classificationsToInsert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-classifications', variables.businessId] });
      console.log('Business classifications saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save business classifications:', error);
      toast({
        title: "Error",
        description: "Failed to save classification data",
        variant: "destructive"
      });
    }
  });
};
