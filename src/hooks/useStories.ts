import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface StoryWithProfile {
  id: string;
  media_url: string | null;
  content: string | null;
  caption: string | null;
  type: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  user_id: string;
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export interface StoryGroup {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  stories: StoryWithProfile[];
}

export const useStories = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async (): Promise<StoryGroup[]> => {
      const { data, error } = await supabase
        .from("stories")
        .select("id, media_url, content, caption, type, created_at, expires_at, views_count, user_id")
        .eq("audience", "public")
        .eq("is_archived", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      // Group by user
      const groupMap = new Map<string, StoryGroup>();
      for (const story of data || []) {
        const profile = profileMap.get(story.user_id);
        if (!groupMap.has(story.user_id)) {
          groupMap.set(story.user_id, {
            user_id: story.user_id,
            username: profile?.username ?? "user",
            display_name: profile?.display_name ?? "User",
            avatar_url: profile?.avatar_url ?? null,
            stories: [],
          });
        }
        groupMap.get(story.user_id)!.stories.push({
          ...story,
          profile: profile ?? null,
        });
      }

      // Put current user first
      const groups = Array.from(groupMap.values());
      if (user) {
        const myIdx = groups.findIndex((g) => g.user_id === user.id);
        if (myIdx > 0) {
          const [mine] = groups.splice(myIdx, 1);
          groups.unshift(mine);
        }
      }

      return groups;
    },
    staleTime: 30000,
  });
};
