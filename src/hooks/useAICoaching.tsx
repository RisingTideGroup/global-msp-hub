
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AICoachingRequest {
  prompt: string;
  context: string;
  type: 'mission' | 'culture' | 'benefits' | 'values' | 'general' | 'cover_letter';
}

export const useAICoaching = () => {
  return useMutation({
    mutationFn: async ({ prompt, context, type }: AICoachingRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-coaching', {
        body: { prompt, context, type }
      });

      if (error) throw error;
      return data;
    }
  });
};

// Hook to get system prompts for the frontend
export const useSystemPrompts = () => {
  return useQuery({
    queryKey: ['ai-system-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-system-prompts');
      if (error) throw error;
      return data.prompts;
    }
  });
};
