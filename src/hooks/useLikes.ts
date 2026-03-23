import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id, reaction_type: "like" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
      queryClient.invalidateQueries({ queryKey: ["video-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
    },
  });
};

export const useUserLikes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-likes", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .not("post_id", "is", null);
      return new Set((data || []).map((l) => l.post_id!));
    },
    enabled: !!user,
    staleTime: 30000,
  });
};
