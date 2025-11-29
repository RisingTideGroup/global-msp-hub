
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIAssistant {
  id: string;
  business_id: string;
  openai_assistant_id: string;
  openai_thread_id: string;
  assistant_type: 'basic' | 'premium';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export const useCreateAIAssistant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ businessId, assistantType, businessContext }: {
      businessId: string;
      assistantType: 'basic' | 'premium';
      businessContext: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-ai-assistant', {
        body: { businessId, assistantType, businessContext }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assistant'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-assistants'] });
      toast({
        title: "AI Assistant Created",
        description: "Your AI business coach is ready to help!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create AI assistant",
        variant: "destructive"
      });
      console.error('AI Assistant creation error:', error);
    }
  });
};

export const useDeleteAIAssistant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assistantId, threadId, dbId }: {
      assistantId: string;
      threadId: string;
      dbId: string;
    }) => {
      // First delete from OpenAI
      const { data, error } = await supabase.functions.invoke('delete-ai-assistant', {
        body: { assistantId, threadId }
      });

      if (error) throw error;

      // Then delete from database
      const { error: deleteError } = await supabase
        .from('ai_assistants')
        .delete()
        .eq('id', dbId);

      if (deleteError) throw deleteError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assistant'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-assistants'] });
      toast({
        title: "AI Assistant Deleted",
        description: "Your AI assistant has been successfully removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete AI assistant",
        variant: "destructive"
      });
      console.error('AI Assistant deletion error:', error);
    }
  });
};

export const useAIAssistant = (businessId?: string) => {
  return useQuery({
    queryKey: ['ai-assistant', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('ai_assistants')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as AIAssistant | null;
    },
    enabled: !!businessId
  });
};
