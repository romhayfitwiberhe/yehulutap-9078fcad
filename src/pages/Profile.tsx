import { Settings, Grid3X3, Bookmark, Play, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "videos">("posts");

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["my-posts", user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      if (activeTab === "saved") {
        const { data: saved } = await supabase
          .from("saved_posts")
          .select("post_id")
          .eq("user_id", user.id);
        if (!saved || saved.length === 0) return [];
        const postIds = saved.map((s) => s.post_id);
        const { data: posts } = await supabase
          .from("posts")
          .select("id, media_urls, thumbnail_url, type, views_count")
          .in("id", postIds);
        return posts || [];
      }
      const query = supabase
        .from("posts")
        .select("id, media_urls, thumbnail_url, type, views_count")
        .eq("user_id", user.id)
        .eq("is_draft", false)
        .order("created_at", { ascending: false });
      if (activeTab === "videos") {
        query.eq("type", "video");
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to see your profile</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">{profile?.username ?? "username"}</span>
          <ChevronDown className="w-4 h-4 text-foreground" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSignOut}><LogOut className="w-5 h-5 text-muted-foreground" /></button>
          <button onClick={() => navigate("/settings")}><Settings className="w-5 h-5 text-foreground" /></button>
        </div>
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

        <div className="flex gap-2 mt-4">
          <button onClick={() => navigate("/edit-profile")} className="flex-1 py-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-lg">
            Edit Profile
          </button>
          <button className="flex-1 py-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-lg">
            Share Profile
          </button>
        </div>
      </div>

      <div className="flex border-b border-border">
        {[
          { key: "posts" as const, icon: Grid3X3 },
          { key: "videos" as const, icon: Play },
          { key: "saved" as const, icon: Bookmark },
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
                  <span className="text-white text-[10px] font-medium">
                    {((post.views_count ?? 0) / 1000).toFixed(1)}K
                  </span>
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

export default Profile;
