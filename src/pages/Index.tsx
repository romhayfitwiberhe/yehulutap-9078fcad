import { Search, Heart, PlusSquare } from "lucide-react";
import StoriesBar from "@/components/home/StoriesBar";
import PostCard from "@/components/home/PostCard";

const mockPosts = [
  {
    id: "1",
    username: "alex_dev",
    avatar: "",
    isVerified: true,
    isFollowing: false,
    timeAgo: "2h",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop",
    caption: "Beautiful morning vibes 🌄 #nature #photography",
    likesCount: 1284,
    commentsCount: 42,
  },
  {
    id: "2",
    username: "sara.miller",
    avatar: "",
    isVerified: false,
    isFollowing: true,
    timeAgo: "5h",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=600&fit=crop",
    caption: "Starry nights ✨ Can't get enough of this view",
    likesCount: 856,
    commentsCount: 18,
  },
  {
    id: "3",
    username: "mike_photo",
    avatar: "",
    isVerified: true,
    isFollowing: false,
    timeAgo: "8h",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop",
    caption: "Lost in the woods 🌲 #explore #adventure",
    likesCount: 2103,
    commentsCount: 67,
  },
  {
    id: "4",
    username: "luna.art",
    avatar: "",
    isVerified: false,
    isFollowing: false,
    timeAgo: "12h",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop",
    caption: "Nature's canvas 🎨 Every day is a masterpiece",
    likesCount: 432,
    commentsCount: 11,
  },
];

const Index = () => {
  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-xl font-bold text-foreground tracking-tight">YehuluTap</h1>
        <div className="flex items-center gap-4">
          <button><Search className="w-6 h-6 text-primary" /></button>
          <button className="relative">
            <Heart className="w-6 h-6 text-primary" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">3</span>
          </button>
        </div>
      </header>

      {/* Stories */}
      <StoriesBar />

      {/* Feed */}
      <div>
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Index;
