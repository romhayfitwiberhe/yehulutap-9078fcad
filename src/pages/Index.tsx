import { Heart, MessageCircle, Send } from "lucide-react";
import StoriesBar from "@/components/home/StoriesBar";
import PostCard from "@/components/home/PostCard";
import CommentDrawer from "@/components/CommentDrawer";
import { usePosts } from "@/hooks/usePosts";
import { useUserLikes } from "@/hooks/useLikes";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { data: posts = [], isLoading } = usePosts();
  const { data: likedPosts } = useUserLikes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  const openComments = (postId: string, count: number) => {
    setCommentPostId(postId);
    setCommentCount(count);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-16">
      {/* Instagram-style header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 h-[44px] bg-background border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <span className="text-[22px] font-bold text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          YehuluTap
        </span>
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <button onClick={() => navigate("/notifications")} className="relative">
                <Heart className="w-[26px] h-[26px] text-foreground" strokeWidth={1.8} />
              </button>
              <button onClick={() => navigate("/inbox")} className="relative">
                <Send className="w-[24px] h-[24px] text-foreground -rotate-12" strokeWidth={1.8} />
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="text-sm font-semibold text-primary">
              Sign In
            </button>
          )}
        </div>
      </header>

      <StoriesBar />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-3">
          <div className="w-16 h-16 rounded-full border-2 border-muted-foreground flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold text-base">No posts yet</p>
          <p className="text-muted-foreground text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPosts?.has(post.id) ?? false}
              onCommentTap={() => openComments(post.id, post.comments_count)}
            />
          ))}
        </div>
      )}

      <CommentDrawer
        postId={commentPostId}
        isOpen={!!commentPostId}
        onClose={() => setCommentPostId(null)}
        commentsCount={commentCount}
      />
    </div>
  );
};

export default Index;
