import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Plus, Mic, MoreVertical, CheckCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  status: string;
}

const timeFormat = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const dateLabel = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("avatar_url, display_name, username").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: otherProfile } = useQuery({
    queryKey: ["chat-partner", conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return null;
      const { data: participants } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId).neq("user_id", user.id).limit(1);
      if (!participants?.[0]) return null;
      const { data: profile } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url, online_at, followers_count, following_count").eq("user_id", participants[0].user_id).single();
      return profile;
    },
    enabled: !!user && !!conversationId,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", user?.id, otherProfile?.user_id],
    queryFn: async () => {
      if (!user || !otherProfile) return false;
      const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", otherProfile.user_id).limit(1);
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user && !!otherProfile,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data } = await supabase.from("messages").select("id, text, sender_id, created_at, is_read, status").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(200);
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 5000,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`chat-${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !conversationId || sending) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, text: msgText });
      if (error) throw error;
    } catch {
      toast.error("Failed to send message");
      setText(msgText);
    } finally {
      setSending(false);
    }
  }, [text, user, conversationId, sending]);

  const handleFollowBack = async () => {
    if (!user || !otherProfile) return;
    await supabase.from("follows").insert({ follower_id: user.id, following_id: otherProfile.user_id });
    queryClient.invalidateQueries({ queryKey: ["is-following"] });
    toast.success("Followed!");
  };

  const isOnline = otherProfile?.online_at ? Date.now() - new Date(otherProfile.online_at).getTime() < 300000 : false;
  const otherName = otherProfile?.display_name || otherProfile?.username || "User";

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === d) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: d, msgs: [msg] });
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-3 h-[56px] bg-primary flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate("/inbox")} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-sm font-semibold text-muted-foreground overflow-hidden">
          {otherProfile?.avatar_url ? (
            <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            otherName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-foreground truncate">{otherName}</p>
          <div className="flex items-center gap-1">
            {isOnline && <div className="w-2 h-2 rounded-full bg-green-400" />}
            <p className="text-[11px] text-primary-foreground/70">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-primary-foreground" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Profile card at top */}
        {otherProfile && messages.length === 0 && (
          <div className="flex flex-col items-center py-6 mb-4">
            <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-2xl font-bold text-muted-foreground overflow-hidden mb-2">
              {otherProfile.avatar_url ? (
                <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                otherName.charAt(0).toUpperCase()
              )}
            </div>
            <p className="font-bold text-foreground">{otherName}</p>
            <p className="text-sm text-muted-foreground">@{otherProfile.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {otherProfile.following_count ?? 0} following · {otherProfile.followers_count ?? 0} followers
            </p>
            {!isFollowing && (
              <button onClick={handleFollowBack} className="mt-3 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                Follow back
              </button>
            )}
          </div>
        )}

        {/* Profile card when there are messages */}
        {otherProfile && messages.length > 0 && (
          <div className="flex flex-col items-center py-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-xl font-bold text-muted-foreground overflow-hidden mb-1.5">
              {otherProfile.avatar_url ? (
                <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                otherName.charAt(0).toUpperCase()
              )}
            </div>
            <p className="font-bold text-sm text-foreground">{otherName}</p>
            <p className="text-xs text-muted-foreground">@{otherProfile.username}</p>
            <p className="text-[11px] text-muted-foreground">
              {otherProfile.following_count ?? 0} following · {otherProfile.followers_count ?? 0} followers
            </p>
            {!isFollowing && (
              <button onClick={handleFollowBack} className="mt-2 px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                Follow back
              </button>
            )}
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <p className="text-center text-[11px] text-muted-foreground my-3 bg-card/50 rounded-full px-3 py-1 mx-auto w-fit">
              {group.date}
            </p>
            {group.msgs.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              const senderAvatar = isMine ? myProfile?.avatar_url : otherProfile?.avatar_url;
              const senderName = isMine ? (myProfile?.display_name || "You") : otherName;

              return (
                <div key={msg.id} className="mb-1.5">
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground rounded-bl-md"}`}>
                      <p className="break-words">{msg.text}</p>
                    </div>
                  </div>
                  {/* Read receipt with avatar */}
                  <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                    <span className={`text-[10px] ${isMine ? "text-primary/60" : "text-muted-foreground"}`}>
                      {timeFormat(msg.created_at)}
                    </span>
                    {isMine && (
                      <>
                        <CheckCheck className={`w-3 h-3 ${msg.is_read ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[10px] text-muted-foreground">{senderName}</span>
                      </>
                    )}
                    {!isMine && (
                      <span className="text-[10px] text-muted-foreground">{senderName}</span>
                    )}
                    {senderAvatar && (
                      <img src={senderAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-background flex-shrink-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Message..."
          className="flex-1 h-10 px-4 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {text.trim() ? (
          <button onClick={handleSend} disabled={sending} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-50 flex-shrink-0">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        ) : (
          <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Chat;
