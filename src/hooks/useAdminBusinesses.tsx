
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseBusiness } from "@/types/shared";
import { useDeleteEntity, useUpdateBusinessStatus } from "@/hooks/useSharedMutations";

export type AdminBusiness = BaseBusiness;

export const useAdminBusinesses = () => {
  return useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_classifications (
            classification_type,
            classification_value
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminBusiness[];
    }
  });
};

export const useDeleteBusiness = () => {
  return useDeleteEntity(
    'businesses',
    'Business',
    ['admin-businesses', 'public-businesses']
  );
};
