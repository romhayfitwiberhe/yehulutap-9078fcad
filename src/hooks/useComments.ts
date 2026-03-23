import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommentWithProfile {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  parent_id: string | null;
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export const useComments = (postId: string | null) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<CommentWithProfile[]> => {
      if (!postId) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("id, text, created_at, user_id, likes_count, parent_id")
        .eq("post_id", postId)
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", userIds);
        profiles = p || [];
      }
      const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

      return (data || []).map((c) => ({
        ...c,
        created_at: c.created_at ?? new Date().toISOString(),
        likes_count: c.likes_count ?? 0,
        profile: profileMap.get(c.user_id) ?? null,
      }));
    },
    enabled: !!postId,
    staleTime: 15000,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, text, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", vars.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
    },
  });
};
