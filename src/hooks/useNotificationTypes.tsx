import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationType {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: 'business' | 'applicant' | 'admin' | 'system';
  default_enabled: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationTypes = (category?: string) => {
  return useQuery({
    queryKey: ['notification-types', category],
    queryFn: async () => {
      let query = supabase
        .from('notification_types')
        .select('*')
        .order('category')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NotificationType[];
    }
  });
};
