import { Search, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NewDMSheet from "@/components/NewDMSheet";

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["inbox-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (!participants || participants.length === 0) return [];

      const convoIds = participants.map((p) => p.conversation_id);
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, last_message_text, last_message_at, updated_at")
        .in("id", convoIds)
        .order("last_message_at", { ascending: false });

      if (!convos) return [];

      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", convoIds)
        .neq("user_id", user.id);

      const otherUserIds = [...new Set((allParticipants || []).map((p) => p.user_id))];
      let profiles: any[] = [];
      if (otherUserIds.length > 0) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url, online_at")
          .in("user_id", otherUserIds);
        profiles = p || [];
      }

      const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));
      const convoParticipantMap = new Map<string, string>();
      (allParticipants || []).forEach((p) => {
        convoParticipantMap.set(p.conversation_id, p.user_id);
      });

      return convos.map((c) => {
        const otherUserId = convoParticipantMap.get(c.id);
        const profile = otherUserId ? profileMap.get(otherUserId) : null;
        const isOnline = profile?.online_at ? (Date.now() - new Date(profile.online_at).getTime()) < 300000 : false;
        return {
          id: c.id,
          name: profile?.display_name || profile?.username || "User",
          avatar_url: profile?.avatar_url,
          lastMsg: c.last_message_text || "",
          time: c.last_message_at ? timeAgo(c.last_message_at) : "",
          online: isOnline,
        };
      });
    },
    enabled: !!user,
    staleTime: 15000,
  });

  // Realtime for inbox updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("inbox-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to see your messages</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-lg font-bold text-foreground">Messages</h1>
        <button><Edit className="w-5 h-5 text-primary" /></button>
      </header>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search messages</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-12">No conversations yet</p>
      ) : (
        <div>
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-card/50 transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold overflow-hidden">
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    chat.name.charAt(0)
                  )}
                </div>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{chat.name}</span>
                  <span className="text-[11px] text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-[13px] truncate text-muted-foreground">{chat.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default Inbox;
