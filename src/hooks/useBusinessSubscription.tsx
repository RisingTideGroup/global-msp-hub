import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useBusinessSubscription = (businessId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user is subscribed to this business
  const { data: isSubscribed, isLoading } = useQuery({
    queryKey: ['business-subscription', businessId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('business_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!businessId,
  });

  // Subscribe to business
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('business_subscriptions')
        .insert({
          user_id: user.id,
          business_id: businessId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.id] });
      toast({
        title: "Subscribed!",
        description: "You'll be notified when this company posts new jobs.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unsubscribe from business
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('business_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions', user?.id] });
      toast({
        title: "Unsubscribed",
        description: "You won't receive notifications from this company anymore.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unsubscribe failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isSubscribed: isSubscribed || false,
    isLoading,
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
};

export const useUserSubscriptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('business_subscriptions')
        .select(`
          id,
          created_at,
          businesses:business_id (
            id,
            name,
            logo_url,
            location,
            industry
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};