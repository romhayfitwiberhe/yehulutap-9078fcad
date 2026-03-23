import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart } from "lucide-react";
import { useComments, useAddComment, CommentWithProfile } from "@/hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CommentDrawerProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  commentsCount: number;
}

const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const CommentDrawer = ({ postId, isOpen, onClose, commentsCount }: CommentDrawerProps) => {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(isOpen ? postId : null);
  const addComment = useAddComment();
  const [text, setText] = useState("");

  const handleSubmit = useCallback(() => {
    if (!text.trim() || !postId) return;
    if (!user) return toast.error("Sign in to comment");
    addComment.mutate({ postId, text: text.trim() });
    setText("");
  }, [text, postId, user, addComment]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-background rounded-t-2xl max-h-[70dvh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-base font-bold text-foreground">
                {commentsCount} Comments
              </span>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Drag handle */}
            <div className="flex justify-center pt-1">
              <div className="w-10 h-1 bg-muted rounded-full" />
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-3 flex items-center gap-2" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
              <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                {user ? (user.email?.charAt(0).toUpperCase() ?? "U") : "?"}
              </div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                disabled={!user}
                className="flex-1 h-10 px-4 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || !user}
                className="p-2 text-primary disabled:text-muted-foreground"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CommentItem = ({ comment }: { comment: CommentWithProfile }) => (
  <div className="flex gap-2.5">
    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
      {comment.profile?.avatar_url ? (
        <img src={comment.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
        comment.profile?.username?.charAt(0).toUpperCase() ?? "U"
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {comment.profile?.username ?? "user"}
        </span>
        <span className="text-[11px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
      </div>
      <p className="text-sm text-foreground mt-0.5">{comment.text}</p>
    </div>
    <button className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
      <Heart className="w-3.5 h-3.5 text-muted-foreground" />
      {comment.likes_count > 0 && (
        <span className="text-[10px] text-muted-foreground">{comment.likes_count}</span>
      )}
    </button>
  </div>
);

export default CommentDrawer;
