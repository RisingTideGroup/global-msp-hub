
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Bookmark {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    business: {
      id: string;
      name: string;
    };
  } | null;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookmarks' as any)
        .select(`
          *,
          job:jobs (
            id,
            title,
            location,
            business:businesses (
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching bookmarks:', error);
        throw error;
      }

      return (data || []) as unknown as Bookmark[];
    },
    enabled: !!user
  });
};

export const useToggleBookmark = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, isBookmarked }: { jobId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks' as any)
          .insert({ user_id: user.id, job_id: jobId });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { isBookmarked }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Job bookmarked",
        description: isBookmarked ? "Job removed from your bookmarks" : "Job added to your bookmarks"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
      console.error('Bookmark error:', error);
    }
  });
};
