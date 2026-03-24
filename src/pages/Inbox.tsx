import { Search, ArrowLeft, UserPlus, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NewDMSheet from "@/components/NewDMSheet";
import StoriesBar from "@/components/home/StoriesBar";

type TabKey = "inbox" | "unread" | "requests";

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewDM, setShowNewDM] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("inbox");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("username").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

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

      // Get unread counts
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convoIds)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      const unreadMap = new Map<string, number>();
      (unreadMessages || []).forEach((m) => {
        unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) || 0) + 1);
      });

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
          username: profile?.username || "user",
          avatar_url: profile?.avatar_url,
          lastMsg: c.last_message_text || "",
          time: c.last_message_at ? formatTime(c.last_message_at) : "",
          online: isOnline,
          unread: unreadMap.get(c.id) || 0,
        };
      });
    },
    enabled: !!user,
    staleTime: 15000,
  });

  const { data: followRequests = [] } = useQuery({
    queryKey: ["follow-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("follow_requests")
        .select("id")
        .eq("target_id", user.id)
        .eq("status", "pending");
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("inbox-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const filteredConversations = conversations.filter((c) => {
    if (searchQuery) {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeTab === "unread") return c.unread > 0;
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to see your messages</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-primary" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-primary-foreground" />
        </button>
        <span className="text-base font-bold text-primary-foreground">{profile?.username ?? "Messages"}</span>
        <button onClick={() => setShowNewDM(true)}>
          <UserPlus className="w-6 h-6 text-primary-foreground" />
        </button>
      </header>

      {/* Story bar */}
      <StoriesBar />

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-2">
        {(["inbox", "unread", "requests"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "requests" && followRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary-foreground text-primary text-[10px] rounded-full font-bold">
                {followRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-1">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-card rounded-lg border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats or people..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Yehulu Notifications */}
      <button className="flex items-center gap-3 w-full px-4 py-3 bg-card/50 border-b border-border">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">Y</span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">Yehulu Notifications</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
          <p className="text-[13px] text-muted-foreground">Transactions, updates & alerts</p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
      </button>

      {/* Conversations */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "requests" ? (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            {followRequests.length > 0 ? `${followRequests.length} pending request(s)` : "No pending requests"}
          </p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-4">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">No messages yet</p>
          <p className="text-sm text-muted-foreground text-center mb-5">Search for people to start a conversation</p>
          <button onClick={() => setShowNewDM(true)} className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Start a conversation
          </button>
        </div>
      ) : (
        <div>
          {filteredConversations.map((chat) => (
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
      <NewDMSheet isOpen={showNewDM} onClose={() => setShowNewDM(false)} />
    </div>
  );
};

const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const d = new Date(date);
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default Inbox;
