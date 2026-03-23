import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Globe } from "lucide-react";
import { useState } from "react";
import { PostWithProfile } from "@/hooks/usePosts";
import { useLikePost } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const timeAgo = (date: string) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
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

  const handleLike = () => {
    if (!user) return navigate("/login");
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    likePost.mutate({ postId: post.id, isLiked: liked });
  };

  const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
  const isVerified = post.profile?.verification_type && post.profile.verification_type !== "none";

  return (
    <article className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold text-sm overflow-hidden">
            {post.profile?.avatar_url ? (
              <img src={post.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (post.profile?.username ?? "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{post.profile?.display_name ?? post.profile?.username ?? "User"}</span>
              {isVerified && (
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <button className="p-1">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {mediaUrl && (
        <div className="w-full bg-card" style={{ maxHeight: "85vh" }}>
          {post.type === "video" ? (
            <video src={mediaUrl} className="w-full object-contain" style={{ maxHeight: "85vh" }} controls playsInline poster={post.thumbnail_url ?? undefined} />
          ) : (
            <img src={mediaUrl} alt="" className="w-full object-contain" style={{ maxHeight: "85vh" }} loading="lazy" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="active:scale-125 transition-transform">
            <Heart className={`w-6 h-6 ${liked ? "text-red-500 fill-red-500" : "text-foreground"}`} />
          </button>
          <button onClick={onCommentTap}>
            <MessageCircle className="w-6 h-6 text-foreground" />
          </button>
          <button>
            <Send className="w-6 h-6 text-foreground" />
          </button>
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={`w-6 h-6 ${saved ? "text-foreground fill-foreground" : "text-foreground"}`} />
        </button>
      </div>

      <div className="px-3 pb-3 space-y-1">
        <p className="text-sm font-semibold text-foreground">{likesCount.toLocaleString()} likes</p>
        {post.caption && (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{post.profile?.username ?? "user"}</span>{" "}
            <span className="text-muted-foreground">{post.caption}</span>
          </p>
        )}
        {post.comments_count > 0 && (
          <button onClick={onCommentTap} className="text-sm text-muted-foreground">
            View all {post.comments_count} comments
          </button>
        )}
      </div>
    </article>
  );
};

export default PostCard;
