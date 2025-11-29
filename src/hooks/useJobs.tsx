
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Job {
  id: string;
  title: string;
  description: string;
  description_rich: string | null;
  requirements: string | null;
  requirements_rich: string | null;
  location: string;
  job_type: string;
  work_arrangement: string;
  salary_min: number | null;
  salary_max: number | null;
  benefits: string | null;
  benefits_rich: string | null;
  posted_at: string;
  is_active: boolean;
  business: {
    id: string;
    name: string;
    description: string | null;
    description_rich: string | null;
    culture: string | null;
    culture_rich: string | null;
    values: string[] | null;
    industry: string | null;
    location: string | null;
    business_classifications?: Array<{
      classification_type: string;
      classification_value: string;
    }>;
  };
  job_classifications?: Array<{
    classification_type: string;
    classification_value: string;
  }>;
}

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses (
            id,
            name,
            description,
            description_rich,
            culture,
            culture_rich,
            values,
            industry,
            location,
            business_classifications (
              classification_type,
              classification_value
            )
          ),
          job_classifications (
            classification_type,
            classification_value
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data as Job[];
    }
  });
};
