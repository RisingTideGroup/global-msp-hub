
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicBusiness {
  id: string;
  name: string;
  description: string | null;
  description_rich: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  website: string | null;
  mission: string | null;
  mission_rich: string | null;
  culture: string | null;
  culture_rich: string | null;
  values: string[] | null;
  benefits: string | null;
  benefits_rich: string | null;
  logo_url: string | null;
  careers_page_url: string | null;
  created_at: string;
  business_classifications?: Array<{
    classification_type: string;
    classification_value: string;
  }>;
}

export const usePublicBusinesses = () => {
  return useQuery({
    queryKey: ['public-businesses'],
    queryFn: async () => {
      console.log('Fetching public businesses...'); // Debug log
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_classifications (
            classification_type,
            classification_value
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      console.log('Fetched businesses data:', data); // Debug log
      return data as PublicBusiness[];
    }
  });
};
