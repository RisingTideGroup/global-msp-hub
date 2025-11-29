import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicJob {
  id: string;
  title: string;
  description: string; // Limited to plain text for public
  location: string;
  job_type: string;
  work_arrangement: string;
  posted_at: string;
  business: {
    id: string;
    name: string;
    industry: string | null;
    location: string | null;
  };
  job_classifications?: Array<{
    classification_type: string;
    classification_value: string;
  }>;
}

export const usePublicJobs = () => {
  return useQuery({
    queryKey: ['public-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          job_type,
          work_arrangement,
          posted_at,
          business:businesses (
            id,
            name,
            industry,
            location
          ),
          job_classifications (
            classification_type,
            classification_value
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false });

      if (error) {
        console.error('Error fetching public jobs:', error);
        throw error;
      }

      return data as PublicJob[];
    }
  });
};