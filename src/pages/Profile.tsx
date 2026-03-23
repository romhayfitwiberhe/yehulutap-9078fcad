import { Settings, Grid3X3, Bookmark, Play, ChevronDown } from "lucide-react";
import { useState } from "react";

const mockPosts = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=300&h=300&fit=crop`,
  isVideo: i % 3 === 0,
  views: Math.floor(Math.random() * 50000),
}));

// Use real placeholder images
const gridImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523805009449-464489b1e58f?w=300&h=300&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=300&fit=crop",
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "videos">("posts");

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">username</span>
          <ChevronDown className="w-4 h-4 text-foreground" />
        </div>
        <button><Settings className="w-5 h-5 text-foreground" /></button>
      </header>

      {/* Profile info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border">
            U
          </div>
          <div className="flex gap-6">
            {[
              { count: "24", label: "Posts" },
              { count: "1.2K", label: "Followers" },
              { count: "348", label: "Following" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-lg font-bold text-foreground">{stat.count}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm font-semibold text-foreground">Display Name</p>
          <p className="text-sm text-muted-foreground">Creator • Photographer • Explorer 📸</p>
          <p className="text-sm text-primary">yehulutap.lovable.app</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-lg">
            Edit Profile
          </button>
          <button className="flex-1 py-1.5 text-sm font-semibold text-foreground bg-card border border-border rounded-lg">
            Share Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: "posts" as const, icon: Grid3X3 },
          { key: "videos" as const, icon: Play },
          { key: "saved" as const, icon: Bookmark },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center py-2.5 border-b-2 transition-colors ${
              activeTab === tab.key ? "border-foreground" : "border-transparent"
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? "text-foreground" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {gridImages.map((url, i) => (
          <div key={i} className="aspect-square bg-card relative">
            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
            {i % 3 === 0 && (
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                <Play className="w-3 h-3 text-white fill-white" />
                <span className="text-white text-[10px] font-medium">
                  {(Math.random() * 50).toFixed(1)}K
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
