
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WebsiteMetadata {
  logoUrl: string | null;
  title: string | null;
  description: string | null;
}

export const useWebsiteLogo = () => {
  return useMutation({
    mutationFn: async (url: string): Promise<WebsiteMetadata> => {
      const { data, error } = await supabase.functions.invoke('fetch-website-logo', {
        body: { url }
      });

      if (error) {
        throw error;
      }

      return data;
    }
  });
};
