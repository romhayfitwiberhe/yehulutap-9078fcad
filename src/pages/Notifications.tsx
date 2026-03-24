import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor_id: string | null;
  actor?: { username: string; avatar_url: string | null; display_name: string };
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id, filter],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (filter === "unread") query = query.eq("is_read", false);
      const { data } = await query;
      if (!data || data.length === 0) return [];

      const actorIds = [...new Set(data.filter((n) => n.actor_id).map((n) => n.actor_id!))];
      let profiles: any[] = [];
      if (actorIds.length > 0) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", actorIds);
        profiles = p || [];
      }
      const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));

      return data.map((n) => ({
        ...n,
        actor: n.actor_id ? profileMap.get(n.actor_id) : undefined,
      })) as Notification[];
    },
    enabled: !!user,
    staleTime: 15000,
  });

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleTap = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    if (notif.type === "follow" && notif.actor_id) {
      navigate(`/user/${notif.actor_id}`);
    } else if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
    }
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return "❤️";
      case "comment": return "💬";
      case "follow": return "👤";
      case "gift": return "🎁";
      case "mention": return "📢";
      default: return "🔔";
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to see notifications</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-lg font-bold text-foreground">Notifications</h1>
        <button onClick={markAllRead} title="Mark all read">
          <Check className="w-5 h-5 text-primary" />
        </button>
      </header>

      <div className="flex gap-2 px-4 py-2">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-12">No notifications yet</p>
      ) : (
        <div>
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleTap(notif)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${!notif.is_read ? "bg-primary/5" : "hover:bg-card/50"}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold overflow-hidden">
                  {notif.actor?.avatar_url ? (
                    <img src={notif.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{getIcon(notif.type)}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {notif.actor && <span className="font-semibold">{notif.actor.display_name || notif.actor.username} </span>}
                  <span className="text-muted-foreground">{notif.message || notif.type}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
