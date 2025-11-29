import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationLog {
  id: string;
  notification_type_key: string;
  recipient_email: string;
  recipient_user_id: string | null;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  error_message: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useNotificationLogs = (limit: number = 100) => {
  return useQuery({
    queryKey: ['notification-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as NotificationLog[];
    }
  });
};
