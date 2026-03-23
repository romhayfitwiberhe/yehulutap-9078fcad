import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
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

const Chat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get other user's profile
  const { data: otherProfile } = useQuery({
    queryKey: ["chat-partner", conversationId],
    queryFn: async () => {
      if (!user || !conversationId) return null;
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId)
        .neq("user_id", user.id)
        .limit(1);
      if (!participants?.[0]) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, online_at")
        .eq("user_id", participants[0].user_id)
        .single();
      return profile;
    },
    enabled: !!user && !!conversationId,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("id, text, sender_id, created_at, is_read, status")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 5000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !conversationId || sending) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        text: msgText,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("Failed to send message");
      setText(msgText);
    } finally {
      setSending(false);
    }
  }, [text, user, conversationId, sending]);

  const isOnline = otherProfile?.online_at
    ? Date.now() - new Date(otherProfile.online_at).getTime() < 300000
    : false;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header
        className="flex items-center gap-3 px-3 h-[56px] border-b border-border bg-background flex-shrink-0"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <button onClick={() => navigate("/inbox")}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-sm font-semibold text-muted-foreground overflow-hidden">
            {otherProfile?.avatar_url ? (
              <img src={otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (otherProfile?.username ?? "U").charAt(0).toUpperCase()
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {otherProfile?.display_name || otherProfile?.username || "User"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isOnline ? "Active now" : "Offline"}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === user?.id;
          const showTime =
            i === 0 ||
            new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300000;

          return (
            <div key={msg.id}>
              {showTime && (
                <p className="text-center text-[10px] text-muted-foreground my-2">
                  {new Date(msg.created_at).toLocaleDateString([], { weekday: "short" })}{" "}
                  {timeFormat(msg.created_at)}
                </p>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {timeFormat(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-t border-border bg-background flex-shrink-0"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Message..."
          className="flex-1 h-10 px-4 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
