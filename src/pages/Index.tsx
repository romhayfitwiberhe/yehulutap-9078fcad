import { Search, Heart } from "lucide-react";
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
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-xl font-bold text-foreground tracking-tight">YehuluTap</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/explore")}><Search className="w-6 h-6 text-primary" /></button>
          {user ? (
            <button onClick={() => navigate("/notifications")} className="relative">
              <Heart className="w-6 h-6 text-primary" />
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="text-sm font-semibold text-primary">
              Sign In
            </button>
          )}
        </div>
      </header>

      <StoriesBar />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-muted-foreground text-sm">No posts yet. Be the first to share!</p>
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
