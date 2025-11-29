
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data?.role as UserRole | null;
    },
    enabled: !!user
  });
};

export const useIsAdmin = () => {
  const { data: role } = useUserRole();
  return role === 'admin';
};

export const useIsModerator = () => {
  const { data: role } = useUserRole();
  return role === 'admin' || role === 'moderator';
};
