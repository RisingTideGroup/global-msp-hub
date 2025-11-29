
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ClassificationType {
  id: string;
  name: string;
  use_case: string[];
  status: 'pending' | 'approved' | 'rejected';
  allow_user_suggestions: boolean;
  display_order: Record<string, number>; // { "business": 1, "job": 2 }
  field_type: 'text' | 'select';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useClassificationTypes = () => {
  return useQuery({
    queryKey: ['classification-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classification_types')
        .select('*')
        .eq('status', 'approved')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ClassificationType[];
    }
  });
};

export const useAdminClassificationTypes = () => {
  return useQuery({
    queryKey: ['admin-classification-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classification_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClassificationType[];
    }
  });
};

export const useCreateClassificationType = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      name, 
      use_case, 
      status = 'pending', 
      allow_user_suggestions = true,
      field_type = 'select',
      display_order = {}
    }: { 
      name: string; 
      use_case: string[]; 
      status?: 'pending' | 'approved' | 'rejected';
      allow_user_suggestions?: boolean;
      field_type?: 'text' | 'select';
      display_order?: Record<string, number>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('classification_types')
        .insert({
          name: name.trim(),
          use_case,
          created_by: user.id,
          status,
          allow_user_suggestions,
          field_type,
          display_order
        })
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Failed to create classification type');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-types'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classification-types'] });
      toast({
        title: "Classification type submitted",
        description: "Your classification type suggestion has been submitted for review."
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Classification type already exists",
          description: "This classification type has already been suggested.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit classification type suggestion",
          variant: "destructive"
        });
      }
      console.error('Classification type creation error:', error);
    }
  });
};

export const useUpdateClassificationType = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      typeId, 
      name, 
      use_case, 
      status, 
      allow_user_suggestions,
      field_type,
      display_order
    }: { 
      typeId: string; 
      name?: string;
      use_case?: string[];
      status?: 'pending' | 'approved' | 'rejected';
      allow_user_suggestions?: boolean;
      field_type?: 'text' | 'select';
      display_order?: Record<string, number>;
    }) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (use_case !== undefined) updateData.use_case = use_case;
      if (status !== undefined) updateData.status = status;
      if (allow_user_suggestions !== undefined) updateData.allow_user_suggestions = allow_user_suggestions;
      if (field_type !== undefined) updateData.field_type = field_type;
      if (display_order !== undefined) updateData.display_order = display_order;

      const { data, error } = await supabase
        .from('classification_types')
        .update(updateData)
        .eq('id', typeId)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Classification type not found');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-types'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classification-types'] });
      toast({
        title: "Classification type updated",
        description: "Classification type has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update classification type",
        variant: "destructive"
      });
      console.error('Classification type update error:', error);
    }
  });
};

export const useUpdateClassificationTypeStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ typeId, status }: { typeId: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('classification_types')
        .update({ status })
        .eq('id', typeId)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Classification type not found');
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['classification-types'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classification-types'] });
      toast({
        title: "Classification type updated",
        description: `Classification type has been ${status}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update classification type status",
        variant: "destructive"
      });
      console.error('Classification type update error:', error);
    }
  });
};

export const useDeleteClassificationType = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (typeId: string) => {
      const { error } = await supabase
        .from('classification_types')
        .delete()
        .eq('id', typeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-types'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classification-types'] });
      toast({
        title: "Classification type deleted",
        description: "Classification type has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete classification type",
        variant: "destructive"
      });
      console.error('Classification type deletion error:', error);
    }
  });
};
