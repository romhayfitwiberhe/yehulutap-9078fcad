import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { PostWithProfile } from "@/hooks/usePosts";
import { useLikePost } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 3600 * 24) return `${Math.floor(s / 3600)}h`;
  if (s < 3600 * 24 * 7) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / (86400 * 7))}w`;
};

interface PostCardProps {
  post: PostWithProfile;
  isLiked: boolean;
  onCommentTap: () => void;
}

const PostCard = ({ post, isLiked, onCommentTap }: PostCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const likePost = useLikePost();
  const [liked, setLiked] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = () => {
    if (!user) return navigate("/login");
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    likePost.mutate({ postId: post.id, isLiked: liked });
  };

  const handleDoubleTap = () => {
    if (!user) return navigate("/login");
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      likePost.mutate({ postId: post.id, isLiked: false });
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  const handleSave = async () => {
    if (!user) return navigate("/login");
    const newSaved = !saved;
    setSaved(newSaved);
    try {
      if (newSaved) {
        await supabase.from("saved_posts").insert({ post_id: post.id, user_id: user.id });
      } else {
        await supabase.from("saved_posts").delete().eq("post_id", post.id).eq("user_id", user.id);
      }
    } catch {
      setSaved(!newSaved);
      toast.error("Action failed");
    }
  };

  const handleShare = async () => {
    const creator = post.profile?.display_name || post.profile?.username || "User";
    const text = `Check out ${creator}'s post on YehuluTap`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  const goToProfile = () => {
    if (post.user_id === user?.id) navigate("/profile");
    else navigate(`/user/${post.user_id}`);
  };

  const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
  const isVerified = post.profile?.verification_type && post.profile.verification_type !== "none";
  const username = post.profile?.username ?? "user";

  return (
    <article className="border-b border-border bg-background">
      {/* Header - Instagram style */}
      <div className="flex items-center justify-between px-3 py-[10px]">
        <button onClick={goToProfile} className="flex items-center gap-[10px]">
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold text-xs overflow-hidden ring-[1.5px] ring-border">
            {post.profile?.avatar_url ? (
              <img src={post.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-foreground">{username}</span>
            {isVerified && (
              <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
            <span className="text-muted-foreground text-[13px] font-normal ml-0.5">• {timeAgo(post.created_at)}</span>
          </div>
        </button>
        <button className="p-1">
          <MoreHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Media - Instagram style with double-tap */}
      {mediaUrl && (
        <div
          className="relative w-full bg-black"
          style={{ maxHeight: "85vh" }}
          onDoubleClick={handleDoubleTap}
        >
          {post.type === "video" ? (
            <video
              src={mediaUrl}
              className="w-full object-contain"
              style={{ maxHeight: "85vh" }}
              controls
              playsInline
              poster={post.thumbnail_url ?? undefined}
            />
          ) : (
            <img
              src={mediaUrl}
              alt=""
              className="w-full object-contain"
              style={{ maxHeight: "85vh" }}
              loading="lazy"
            />
          )}

          {/* Double-tap heart animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action bar - Instagram style */}
      <div className="flex items-center justify-between px-3 pt-[10px] pb-1">
        <div className="flex items-center gap-[14px]">
          <button onClick={handleLike} className="active:scale-110 transition-transform">
            <Heart className={`w-[26px] h-[26px] ${liked ? "text-red-500 fill-red-500" : "text-foreground"}`} strokeWidth={1.8} />
          </button>
          <button onClick={onCommentTap} className="active:scale-110 transition-transform">
            <MessageCircle className="w-[26px] h-[26px] text-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={handleShare} className="active:scale-110 transition-transform">
            <Send className="w-[24px] h-[24px] text-foreground -rotate-12" strokeWidth={1.8} />
          </button>
        </div>
        <button onClick={handleSave} className="active:scale-110 transition-transform">
          <Bookmark className={`w-[26px] h-[26px] ${saved ? "text-foreground fill-foreground" : "text-foreground"}`} strokeWidth={1.8} />
        </button>
      </div>

      {/* Likes count */}
      {likesCount > 0 && (
        <div className="px-3 pt-1">
          <p className="text-[13px] font-semibold text-foreground">{likesCount.toLocaleString()} likes</p>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pt-1">
          <p className="text-[13px] text-foreground">
            <span className="font-semibold">{username}</span>{" "}
            <span className="font-normal">{post.caption}</span>
          </p>
        </div>
      )}

      {/* View comments */}
      {post.comments_count > 0 && (
        <button onClick={onCommentTap} className="px-3 pt-1">
          <p className="text-[13px] text-muted-foreground">View all {post.comments_count} comments</p>
        </button>
      )}

      <div className="h-3" />
    </article>
  );
};

export default PostCard;
