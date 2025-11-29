import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationTemplate {
  id: string;
  notification_type_id: string;
  template_type: 'system_default' | 'admin_global';
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationTemplates = () => {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('template_type');

      if (error) throw error;
      return data as NotificationTemplate[];
    }
  });
};

export const useUpdateNotificationTemplate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      notificationTypeId, 
      subject, 
      bodyHtml, 
      bodyText 
    }: { 
      notificationTypeId: string; 
      subject: string; 
      bodyHtml: string; 
      bodyText?: string;
    }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .upsert({
          notification_type_id: notificationTypeId,
          template_type: 'admin_global',
          subject,
          body_html: bodyHtml,
          body_text: bodyText,
          is_active: true
        }, {
          onConflict: 'notification_type_id,template_type'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: "Template updated",
        description: "Notification template has been saved successfully."
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
