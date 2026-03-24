import { Settings, Grid3X3, Bookmark, Heart, Lock, Play, ChevronDown, Camera, Edit2, Coins } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import FollowersSheet from "@/components/FollowersSheet";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"videos" | "saved" | "liked" | "private">("videos");
  const [followSheet, setFollowSheet] = useState<{ open: boolean; tab: "followers" | "following" }>({ open: false, tab: "followers" });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["my-posts", user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      if (activeTab === "saved") {
        const { data: saved } = await supabase.from("saved_posts").select("post_id").eq("user_id", user.id);
        if (!saved || saved.length === 0) return [];
        const postIds = saved.map((s) => s.post_id);
        const { data: posts } = await supabase.from("posts").select("id, media_urls, thumbnail_url, type, views_count").in("id", postIds);
        return posts || [];
      }
      if (activeTab === "liked") {
        const { data: liked } = await supabase.from("likes").select("post_id").eq("user_id", user.id).not("post_id", "is", null);
        if (!liked || liked.length === 0) return [];
        const postIds = liked.filter(l => l.post_id).map((l) => l.post_id!);
        const { data: posts } = await supabase.from("posts").select("id, media_urls, thumbnail_url, type, views_count").in("id", postIds);
        return posts || [];
      }
      if (activeTab === "private") {
        const { data } = await supabase.from("posts").select("id, media_urls, thumbnail_url, type, views_count").eq("user_id", user.id).neq("audience", "public").order("created_at", { ascending: false });
        return data || [];
      }
      // videos tab - all posts
      const { data } = await supabase.from("posts").select("id, media_urls, thumbnail_url, type, views_count").eq("user_id", user.id).eq("is_draft", false).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to see your profile</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  const isVerified = profile?.verification_type && profile.verification_type !== "none";
  const verificationEmoji = profile?.verification_type === "gold" ? "🟡" : profile?.verification_type === "blue" ? "🔵" : "";

  const tabs = [
    { key: "videos" as const, icon: Grid3X3, label: "Videos" },
    { key: "saved" as const, icon: Bookmark, label: "Save" },
    { key: "liked" as const, icon: Heart, label: "Like" },
    { key: "private" as const, icon: Lock, label: "Private" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      {/* Header with settings */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">{profile?.username ?? "username"}</span>
          <ChevronDown className="w-4 h-4 text-foreground" />
        </div>
        <button onClick={() => navigate("/settings")}>
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Avatar section */}
      <div className="flex flex-col items-center pt-2 pb-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-[3px] border-primary p-1">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-3xl font-bold text-muted-foreground overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (profile?.username ?? "U").charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-card border-2 border-background flex items-center justify-center">
            <Camera className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <h2 className="mt-3 text-xl font-bold text-foreground flex items-center gap-1">
          {profile?.display_name ?? "User"} {isVerified && <span>{verificationEmoji}</span>}
        </h2>
        <p className="text-sm text-muted-foreground">@{profile?.username ?? "user"}</p>
        {profile?.profession_title && (
          <p className="text-sm text-primary mt-0.5">{profile.profession_title}</p>
        )}
        {profile?.bio && <p className="text-sm text-muted-foreground mt-1 text-center px-8">{profile.bio}</p>}
        {profile?.website && (
          <button className="mt-2 w-9 h-9 rounded-full bg-card/80 flex items-center justify-center">
            <span className="text-muted-foreground text-lg">🌐</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mx-6 rounded-xl bg-card p-4 flex justify-between">
        {[
          { count: profile?.following_count ?? 0, label: "Following", action: () => setFollowSheet({ open: true, tab: "following" }) },
          { count: profile?.followers_count ?? 0, label: "Followers", action: () => setFollowSheet({ open: true, tab: "followers" }) },
          { count: profile?.likes_count ?? 0, label: "Likes" },
          { count: profile?.views_count ?? 0, label: "Views" },
        ].map((stat) => (
          <button key={stat.label} onClick={stat.action} className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">{stat.count}</span>
            <span className="text-[11px] text-muted-foreground">{stat.label}</span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mx-6 mt-4">
        <button
          onClick={() => navigate("/edit-profile")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
        <button
          onClick={() => navigate("/settings/wallet")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm"
        >
          <Coins className="w-4 h-4" />
          {wallet?.balance ?? 0} Coins
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mt-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 border-b-2 transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid - 2 columns for TikTok style */}
      <div className="grid grid-cols-2 gap-1 p-1">
        {posts.map((post) => {
          const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
          return (
            <div key={post.id} className="aspect-[9/16] bg-card relative rounded-lg overflow-hidden">
              {mediaUrl ? (
                <img src={mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              {post.type === "video" && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-white text-[11px] font-medium">{post.views_count ?? 0}</span>
                </div>
              )}
            </div>
          );
        })}
        {posts.length === 0 && (
          <div className="col-span-2 py-12 text-center">
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        )}
      </div>
      <FollowersSheet
        userId={user.id}
        initialTab={followSheet.tab}
        open={followSheet.open}
        onClose={() => setFollowSheet((s) => ({ ...s, open: false }))}
      />
    </div>
};

export default Profile;
