import { useState, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2, Music, Plus, Bookmark } from "lucide-react";
import { useVideoPosts, PostWithProfile } from "@/hooks/usePosts";
import { useLikePost, useUserLikes } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import CommentDrawer from "@/components/CommentDrawer";
import { Home, Play, PlusSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always bg-black flex-shrink-0">
      {mediaUrl && (
        video.type === "video" ? (
          <video
            src={mediaUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={video.thumbnail_url ?? undefined}
          />
        ) : (
          <img src={mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Right sidebar */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        <div className="relative mb-2">
          <div className="w-11 h-11 rounded-full bg-card border-2 border-white flex items-center justify-center text-sm font-bold text-white overflow-hidden">
            {video.profile?.avatar_url ? (
              <img src={video.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>

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
          <span className="text-white text-[11px] font-medium">Save</span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-medium">{formatCount(video.shares_count)}</span>
        </button>

        <div className="w-10 h-10 rounded-full bg-card border-2 border-muted animate-spin-slow flex items-center justify-center">
          <Music className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-3 right-16 space-y-2">
        <span className="text-white font-bold text-[15px]">@{username}</span>
        {video.caption && <p className="text-white text-[13px] leading-snug line-clamp-2">{video.caption}</p>}
      </div>

      <CommentDrawer
        postId={video.id}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        commentsCount={video.comments_count}
      />
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
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center pt-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <span className="text-white font-bold text-lg">Videos</span>
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
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} isLiked={likedPosts?.has(video.id) ?? false} />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around h-[52px]">
          <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5">
            <Home className="w-6 h-6 text-white/60" />
            <span className="text-[10px] text-white/60">Home</span>
          </button>
          <button className="flex flex-col items-center gap-0.5">
            <Play className="w-6 h-6 text-white" fill="white" />
            <span className="text-[10px] text-white font-medium">Videos</span>
          </button>
          <button onClick={() => navigate("/upload")} className="flex items-center justify-center w-11 h-8 bg-white rounded-lg">
            <PlusSquare className="w-5 h-5 text-black" />
          </button>
          <button onClick={() => navigate("/inbox")} className="flex flex-col items-center gap-0.5">
            <MessageCircle className="w-6 h-6 text-white/60" />
            <span className="text-[10px] text-white/60">Inbox</span>
          </button>
          <button onClick={() => navigate("/profile")} className="flex flex-col items-center gap-0.5">
            <User className="w-6 h-6 text-white/60" />
            <span className="text-[10px] text-white/60">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Videos;
