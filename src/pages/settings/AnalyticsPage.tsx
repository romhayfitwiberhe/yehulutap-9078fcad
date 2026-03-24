import { ArrowLeft, Eye, Heart, MessageSquare, Share2, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["my-all-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("posts").select("id, likes_count, comments_count, shares_count, views_count, type, created_at").eq("user_id", user.id).eq("is_draft", false).order("views_count", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  const totalViews = profile?.views_count ?? 0;
  const totalLikes = profile?.likes_count ?? 0;
  const totalComments = posts.reduce((s, p) => s + (p.comments_count ?? 0), 0);
  const totalShares = posts.reduce((s, p) => s + (p.shares_count ?? 0), 0);
  const followers = profile?.followers_count ?? 0;
  const engagement = totalViews > 0 ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(1) : "0.0";

  const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Analytics</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Eye, label: "VIEWS", value: totalViews, color: "text-blue-500" },
            { icon: Heart, label: "LIKES", value: totalLikes, color: "text-red-500" },
            { icon: MessageSquare, label: "COMMENTS", value: totalComments, color: "text-yellow-500" },
            { icon: Share2, label: "SHARES", value: totalShares, color: "text-green-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card p-4 flex flex-col items-center gap-2">
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl bg-card p-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{engagement}%</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">ENGAGEMENT</span>
          </div>
          <div className="rounded-xl bg-card p-4 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold text-foreground">{followers}</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">FOLLOWERS</span>
          </div>
        </div>

        {/* Earnings */}
        <div className="mt-4 rounded-xl bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <span className="text-sm font-bold text-foreground">Earnings</span>
          </div>
          <span className="text-sm font-bold text-foreground">0 coins</span>
        </div>

        {/* Weekly chart */}
        <h3 className="mt-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</h3>
        <div className="mt-2 rounded-xl bg-card p-4">
          <div className="flex items-end justify-between h-16 gap-2">
            {days.map((day) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary rounded-sm" style={{ height: `${Math.random() * 24 + 8}px` }} />
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top content */}
        <h3 className="mt-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Content</h3>
        <div className="mt-2 rounded-xl bg-card overflow-hidden">
          {posts.slice(0, 5).map((post, i) => (
            <div key={post.id} className={`flex items-center gap-3 px-4 py-3 ${i < 4 ? "border-b border-border" : ""}`}>
              <span className="text-sm font-bold text-primary w-4">{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Post</p>
                <p className="text-xs text-muted-foreground">{post.views_count ?? 0} views · {post.likes_count ?? 0} likes</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">{posts.length} total posts analyzed</p>
      </div>
    </div>
  );
};

export default AnalyticsPage;
