import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2, Plus, Bookmark, ArrowLeft, MoreVertical, Gift } from "lucide-react";
import { useVideoPosts, PostWithProfile } from "@/hooks/usePosts";
import { useLikePost, useUserLikes } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import CommentDrawer from "@/components/CommentDrawer";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const VideoCard = ({ video, isLiked }: { video: PostWithProfile; isLiked: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const likePost = useLikePost();
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const handleLike = () => {
    if (!user) return navigate("/login");
    setLiked(!liked);
    likePost.mutate({ postId: video.id, isLiked: liked });
  };

  const mediaUrl = video.media_urls?.[0] || video.thumbnail_url;
  const username = video.profile?.username ?? "user";
  const displayName = video.profile?.display_name ?? username;
  const isVerified = video.profile?.verification_type && video.profile.verification_type !== "none";
  const verificationEmoji = video.profile?.verification_type === "gold" ? "🟡" : video.profile?.verification_type === "blue" ? "🔵" : "";

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always bg-black flex-shrink-0">
      {mediaUrl && (
        video.type === "video" ? (
          <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline poster={video.thumbnail_url ?? undefined} />
        ) : (
          <img src={mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Right sidebar */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
          <Heart className={`w-7 h-7 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
          <span className="text-white text-[11px] font-medium">{formatCount(video.likes_count + (liked && !isLiked ? 1 : 0))}</span>
        </button>

        <button onClick={() => setCommentOpen(true)} className="flex flex-col items-center gap-0.5">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-medium">{formatCount(video.comments_count)}</span>
        </button>

        <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-0.5">
          <Bookmark className={`w-7 h-7 ${saved ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
          <span className="text-white text-[11px] font-medium">{formatCount(video.shares_count)}</span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-medium">{formatCount(video.shares_count)}</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-3 right-16 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-card border-2 border-white flex items-center justify-center overflow-hidden">
          {video.profile?.avatar_url ? (
            <img src={video.profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-white font-bold text-sm flex items-center gap-1">
          {displayName} {isVerified && <span>{verificationEmoji}</span>}
        </span>
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center ml-auto">
          <Gift className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-3 right-3 space-y-1">
        <div className="flex justify-between text-white text-[11px]">
          <span>0:01 / 1:52</span>
        </div>
        <div className="h-1 bg-white/30 rounded-full">
          <div className="h-full w-[2%] bg-white rounded-full" />
        </div>
      </div>

      <CommentDrawer postId={video.id} isOpen={commentOpen} onClose={() => setCommentOpen(false)} commentsCount={video.comments_count} />
    </div>
  );
};

const Videos = () => {
  const { data: videos = [], isLoading } = useVideoPosts();
  const { data: likedPosts } = useUserLikes();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    setActiveIndex(Math.round(scrollTop / height));
  }, []);

  return (
    <div className="fixed inset-0 z-30 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <button onClick={() => navigate(-1 as any)} className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-bold text-lg">Shorts</span>
        <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/60 text-sm">No videos yet</p>
        </div>
      ) : (
        <div ref={containerRef} onScroll={handleScroll} className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} isLiked={likedPosts?.has(video.id) ?? false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Videos;
