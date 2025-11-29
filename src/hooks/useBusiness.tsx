
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { BaseBusiness } from "@/types/shared";

export interface Business extends BaseBusiness {}

export const useBusiness = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_classifications (
            classification_type,
            classification_value
          )
        `)
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Business | null;
    },
    enabled: !!user
  });
};

export const useCreateBusiness = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (businessData: Omit<BaseBusiness, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'business_classifications'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: user.id
        })
        .select()
        .maybeSingle();

      if (error || !data) throw error || new Error('Failed to create business');
      return data;
    },
    onSuccess: async (businessData) => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      
      // Send admin notification about new business registration
      try {
        const siteUrl = window.location.origin;
        
        // Get owner details
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user?.id)
          .single();
        
        await supabase.functions.invoke('process-notification', {
          body: {
            notificationType: 'new_business_registered',
            recipientUserId: null, // Admin notification
            recipientEmail: 'admin@example.com', // Replace with actual admin email
            context: {
              business_name: businessData.name,
              owner_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user?.email || 'Unknown',
              industry: businessData.industry || 'Not specified',
              admin_link: `${siteUrl}/admin?tab=businesses`
            }
          }
        });
      } catch (error) {
        console.error('Failed to send new business notification:', error);
      }
      
      toast({
        title: "Success",
        description: "Business created successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Failed to create business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create business",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateBusiness = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<BaseBusiness> & { id: string }) => {
      // Remove business_classifications from updateData since it's not a direct business table field
      const { business_classifications, ...businessData } = updateData;
      
      const { data, error } = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error || !data) throw error || new Error('Business not found');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      toast({
        title: "Success",
        description: "Business updated successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Failed to update business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update business",
        variant: "destructive"
      });
    }
  });
};
