import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Globe } from "lucide-react";
import { useState } from "react";

interface Post {
  id: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  timeAgo: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
}

const PostCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <article className="border-b border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold text-sm overflow-hidden">
            {post.avatar ? (
              <img src={post.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              post.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{post.username}</span>
              {post.isVerified && (
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              {!post.isFollowing && (
                <button className="ml-1 px-3 py-0.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                  Follow
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground">{post.timeAgo}</span>
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          </div>
        </div>
        <button className="p-1">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Image */}
      <div className="w-full bg-card aspect-square">
        <img
          src={post.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="active:scale-125 transition-transform">
            <Heart
              className={`w-6 h-6 ${liked ? "text-red-500 fill-red-500" : "text-foreground"}`}
            />
          </button>
          <button>
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

      {/* Likes & Caption */}
      <div className="px-3 pb-3 space-y-1">
        <p className="text-sm font-semibold text-foreground">{likesCount.toLocaleString()} likes</p>
        <p className="text-sm text-foreground">
          <span className="font-semibold">{post.username}</span>{" "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
        {post.commentsCount > 0 && (
          <button className="text-sm text-muted-foreground">
            View all {post.commentsCount} comments
          </button>
        )}
      </div>
    </article>
  );
};

export default PostCard;
