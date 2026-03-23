import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, MessageCircle, Share2, Music, Plus, Bookmark } from "lucide-react";

interface VideoItem {
  id: string;
  username: string;
  caption: string;
  sound: string;
  likes: number;
  comments: number;
  shares: number;
  videoUrl: string;
  posterUrl: string;
}

const mockVideos: VideoItem[] = [
  {
    id: "1",
    username: "creator_one",
    caption: "This sunset is unreal 🌅 #fyp #sunset #vibes",
    sound: "Original Sound - creator_one",
    likes: 24500,
    comments: 342,
    shares: 89,
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=700&fit=crop",
  },
  {
    id: "2",
    username: "dance_queen",
    caption: "New dance challenge 💃 Who's in? #dance #challenge",
    sound: "Popular Song - Artist",
    likes: 89200,
    comments: 1203,
    shares: 456,
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=700&fit=crop",
  },
  {
    id: "3",
    username: "foodie_life",
    caption: "Best recipe ever 🍝 Save this! #food #recipe #cooking",
    sound: "Cooking Vibes - Chef Mix",
    likes: 15800,
    comments: 567,
    shares: 234,
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=700&fit=crop",
  },
  {
    id: "4",
    username: "travel_addict",
    caption: "Hidden gem in Ethiopia 🇪🇹 #travel #ethiopia #explore",
    sound: "Ethiopian Vibes - DJ Mix",
    likes: 45600,
    comments: 890,
    shares: 567,
    videoUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1523805009449-464489b1e58f?w=400&h=700&fit=crop",
  },
];

const formatCount = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const VideoCard = ({ video, isActive }: { video: VideoItem; isActive: boolean }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative w-full h-[100dvh] snap-start snap-always bg-black flex-shrink-0">
      {/* Video/Poster */}
      <img
        src={video.posterUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Right sidebar actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="relative mb-2">
          <div className="w-11 h-11 rounded-full bg-card border-2 border-foreground flex items-center justify-center text-sm font-bold text-foreground overflow-hidden">
            {video.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>

        {/* Like */}
        <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-0.5">
          <Heart className={`w-7 h-7 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
          <span className="text-white text-[11px] font-medium">{formatCount(video.likes + (liked ? 1 : 0))}</span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-0.5">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-medium">{formatCount(video.comments)}</span>
        </button>

        {/* Save */}
        <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-0.5">
          <Bookmark className={`w-7 h-7 ${saved ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
          <span className="text-white text-[11px] font-medium">Save</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-0.5">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-medium">{formatCount(video.shares)}</span>
        </button>

        {/* Sound disc */}
        <div className="w-10 h-10 rounded-full bg-card border-2 border-muted animate-spin-slow flex items-center justify-center">
          <Music className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-3 right-16 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-[15px]">@{video.username}</span>
        </div>
        <p className="text-white text-[13px] leading-snug line-clamp-2">{video.caption}</p>
        <div className="flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-white" />
          <p className="text-white text-xs truncate">{video.sound}</p>
        </div>
      </div>
    </div>
  );
};

const Videos = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    setActiveIndex(newIndex);
  }, []);

  return (
    <div className="fixed inset-0 z-30 bg-black">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center pt-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <span className="text-white font-bold text-lg">Videos</span>
      </div>

      {/* Video feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {mockVideos.map((video, index) => (
          <VideoCard key={video.id} video={video} isActive={index === activeIndex} />
        ))}
      </div>

      {/* Bottom nav for videos page */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <VideoBottomNav />
      </div>
    </div>
  );
};

// Separate bottom nav for videos (light-on-dark)
import { Home, Play, PlusSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VideoBottomNav = () => {
  const navigate = useNavigate();
  return (
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
  );
};

export default Videos;
