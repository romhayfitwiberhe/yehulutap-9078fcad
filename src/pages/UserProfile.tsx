import { useState } from "react";
import { ArrowLeft, Grid3X3, Play, MoreHorizontal } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"posts" | "videos">("posts");

  const { data: profile } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ["is-following", user?.id, userId],
    queryFn: async () => {
      if (!user || !userId) return false;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user && !!userId && user.id !== userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error("Not authenticated");
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: () => toast.error("Action failed"),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["user-posts", userId, activeTab],
    queryFn: async () => {
      if (!userId) return [];
      const query = supabase
        .from("posts")
        .select("id, media_urls, thumbnail_url, type, views_count")
        .eq("user_id", userId)
        .eq("is_draft", false)
        .order("created_at", { ascending: false });
      if (activeTab === "videos") query.eq("type", "video");
      const { data } = await query;
      return data || [];
    },
    enabled: !!userId,
  });

  const handleMessage = async () => {
    if (!user || !userId) return navigate("/login");
    try {
      const { data, error } = await supabase.rpc("create_dm_conversation", { _other_user_id: userId });
      if (error) throw error;
      navigate(`/chat/${data}`);
    } catch {
      toast.error("Could not start conversation");
    }
  };

  const isOwn = user?.id === userId;

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-lg font-bold text-foreground truncate">{profile?.username ?? "User"}</span>
      </header>

      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.username ?? "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex gap-6">
            {[
              { count: profile?.posts_count ?? 0, label: "Posts" },
              { count: profile?.followers_count ?? 0, label: "Followers" },
              { count: profile?.following_count ?? 0, label: "Following" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">{stat.count}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm font-semibold text-foreground">{profile?.display_name ?? ""}</p>
          {profile?.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          {profile?.website && <p className="text-sm text-primary">{profile.website}</p>}
        </div>

        {!isOwn && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                if (!user) return navigate("/login");
                followMutation.mutate();
              }}
              disabled={followMutation.isPending}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                isFollowing
                  ? "text-foreground bg-card border border-border"
                  : "text-primary-foreground bg-primary"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button onClick={handleMessage} className="flex-1 py-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-lg">
              Message
            </button>
          </div>
        )}
      </div>

      <div className="flex border-b border-border">
        {[
          { key: "posts" as const, icon: Grid3X3 },
          { key: "videos" as const, icon: Play },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center py-2.5 border-b-2 transition-colors ${activeTab === tab.key ? "border-foreground" : "border-transparent"}`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? "text-foreground" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post) => {
          const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
          return (
            <div key={post.id} className="aspect-square bg-card relative">
              {mediaUrl ? (
                <img src={mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              {post.type === "video" && (
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-white text-[10px] font-medium">{((post.views_count ?? 0) / 1000).toFixed(1)}K</span>
                </div>
              )}
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="col-span-3 py-12 text-center">
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
