import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PostWithProfile {
  id: string;
  caption: string | null;
  media_urls: string[] | null;
  thumbnail_url: string | null;
  type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
    verification_type: string | null;
  } | null;
}

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts-feed"],
    queryFn: async (): Promise<PostWithProfile[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, caption, media_urls, thumbnail_url, type,
          likes_count, comments_count, shares_count, views_count,
          created_at, user_id
        `)
        .eq("is_draft", false)
        .eq("audience", "public")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, verification_type")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return (data || []).map((post) => ({
        ...post,
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        shares_count: post.shares_count ?? 0,
        views_count: post.views_count ?? 0,
        profile: profileMap.get(post.user_id) ?? null,
      }));
    },
    staleTime: 30000,
  });
};

export const useVideoPosts = () => {
  return useQuery({
    queryKey: ["video-posts"],
    queryFn: async (): Promise<PostWithProfile[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, caption, media_urls, thumbnail_url, type,
          likes_count, comments_count, shares_count, views_count,
          created_at, user_id
        `)
        .eq("is_draft", false)
        .eq("audience", "public")
        .eq("type", "video")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set((data || []).map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, verification_type")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return (data || []).map((post) => ({
        ...post,
        likes_count: post.likes_count ?? 0,
        comments_count: post.comments_count ?? 0,
        shares_count: post.shares_count ?? 0,
        views_count: post.views_count ?? 0,
        profile: profileMap.get(post.user_id) ?? null,
      }));
    },
    staleTime: 30000,
  });
};
