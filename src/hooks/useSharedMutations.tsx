
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDeleteEntity = (table: 'businesses' | 'jobs', entityType: string, invalidateKeys: string[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entityId: string) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', entityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      toast({
        title: `${entityType} deleted`,
        description: `${entityType} has been permanently removed.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete ${entityType.toLowerCase()}`,
        variant: "destructive"
      });
      console.error(`${entityType} deletion error:`, error);
    }
  });
};

export const useUpdateBusinessStatus = (invalidateKeys: string[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId, status }: { entityId: string; status: 'approved' | 'rejected' | 'pending' }) => {
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user attempting update:', user?.id, user?.email);
      
      const { data, error, count } = await supabase
        .from('businesses')
        .update({ status })
        .eq('id', entityId)
        .select()
        .maybeSingle();
      
      console.log('Update result:', { data, error, count });
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      if (!data) {
        throw new Error('Business not found or you do not have permission to update it. Check console for details.');
      }
      return data;
    },
    onSuccess: (_, { status }) => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      toast({
        title: "Business status updated",
        description: `Business has been ${status}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update business status",
        variant: "destructive"
      });
      console.error("Business status update error:", error);
    }
  });
};

export const useToggleEntityBoolean = (
  table: 'businesses' | 'jobs',
  field: string,
  entityType: string,
  invalidateKeys: string[]
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityId, value }: { entityId: string; value: boolean }) => {
      const { data, error } = await supabase
        .from(table)
        .update({ [field]: value })
        .eq('id', entityId)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Entity not found');
      return data;
    },
    onSuccess: (_, { value }) => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      toast({
        title: `${entityType} status updated`,
        description: `${entityType} has been ${value ? 'activated' : 'deactivated'}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update ${entityType.toLowerCase()} status`,
        variant: "destructive"
      });
      console.error(`${entityType} status update error:`, error);
    }
  });
};
