
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Classification {
  id: string;
  name: string;
  type: string;
  use_case: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useClassifications = (type?: string, useCase?: string) => {
  return useQuery({
    queryKey: ['classifications', type, useCase],
    queryFn: async () => {
      let query = supabase
        .from('classifications')
        .select('*')
        .eq('status', 'approved')
        .order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      if (useCase) {
        query = query.contains('use_case', [useCase]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Classification[];
    }
  });
};

export const useAdminClassifications = () => {
  return useQuery({
    queryKey: ['admin-classifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Classification[];
    }
  });
};

export const useCreateClassification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, type, use_case, status = 'pending' }: { 
      name: string; 
      type: string; 
      use_case: string[]; 
      status?: 'pending' | 'approved' | 'rejected' 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('classifications')
        .insert({
          name: name.trim(),
          type,
          use_case,
          created_by: user.id,
          status
        })
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Failed to create classification');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classifications'] });
      toast({
        title: data.status === 'approved' ? "Classification added" : "Classification submitted",
        description: data.status === 'approved' 
          ? "Your classification has been added and is ready to use."
          : "Your classification suggestion has been submitted for review."
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Classification already exists",
          description: "This classification has already been suggested.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit classification suggestion",
          variant: "destructive"
        });
      }
      console.error('Classification creation error:', error);
    }
  });
};

export const useUpdateClassificationStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classificationId, status }: { classificationId: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('classifications')
        .update({ status })
        .eq('id', classificationId)
        .select()
        .maybeSingle();
      
      if (error || !data) throw error || new Error('Classification not found');
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['classifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classifications'] });
      toast({
        title: "Classification updated",
        description: `Classification has been ${status}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update classification status",
        variant: "destructive"
      });
      console.error('Classification update error:', error);
    }
  });
};

export const useDeleteClassification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classificationId: string) => {
      const { error } = await supabase
        .from('classifications')
        .delete()
        .eq('id', classificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classifications'] });
      toast({
        title: "Classification deleted",
        description: "Classification has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete classification",
        variant: "destructive"
      });
      console.error('Classification deletion error:', error);
    }
  });
};

// Legacy hooks for backward compatibility
export const useIndustries = () => useClassifications('Industry', 'business');
export const useAdminIndustries = () => useAdminClassifications();
export const useCreateIndustry = () => {
  const createClassification = useCreateClassification();
  return {
    ...createClassification,
    mutate: (name: string, options?: any) => 
      createClassification.mutate({ 
        name, 
        type: 'Industry', 
        use_case: ['business', 'job'] 
      }, options)
  };
};
export const useUpdateIndustryStatus = useUpdateClassificationStatus;
export const useDeleteIndustry = useDeleteClassification;
