
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface GDPRDeletion {
  id: string;
  user_id: string;
  email: string | null;
  deletion_requested_at: string;
  deletion_completed_at: string | null;
  status: string;
  anonymization_data: any;
}

export const useRequestGDPRDeletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('gdpr_deletions')
        .insert({
          user_id: user.id,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Deletion request submitted",
        description: "Your data deletion request has been submitted and will be processed within 30 days."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit deletion request",
        variant: "destructive"
      });
      console.error('GDPR deletion request error:', error);
    }
  });
};

export const useGDPRDeletions = () => {
  return useQuery({
    queryKey: ['gdpr-deletions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gdpr_deletions')
        .select('*')
        .order('deletion_requested_at', { ascending: false });

      if (error) throw error;
      return data as GDPRDeletion[];
    }
  });
};
