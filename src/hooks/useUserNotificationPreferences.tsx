import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserNotificationPreference {
  id: string;
  user_id: string;
  notification_type_id: string;
  is_enabled: boolean;
  custom_template_subject: string | null;
  custom_template_body: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserNotificationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserNotificationPreference[];
    },
    enabled: !!user
  });
};

export const useToggleNotificationPreference = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      notificationTypeId, 
      isEnabled 
    }: { 
      notificationTypeId: string; 
      isEnabled: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          notification_type_id: notificationTypeId,
          is_enabled: isEnabled
        }, {
          onConflict: 'user_id,notification_type_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notification-preferences'] });
      toast({
        title: "Preference updated",
        description: "Your notification preference has been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
