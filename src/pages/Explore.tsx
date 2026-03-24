import { useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");

  const { data: users = [], isFetching: fetchingUsers } = useQuery({
    queryKey: ["search-users", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, followers_count, verification_type")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .order("followers_count", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: query.trim().length > 0 && activeTab === "users",
    staleTime: 10000,
  });

  const { data: posts = [], isFetching: fetchingPosts } = useQuery({
    queryKey: ["search-posts", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await supabase
        .from("posts")
        .select("id, media_urls, thumbnail_url, type, views_count, caption")
        .eq("is_draft", false)
        .ilike("caption", `%${query}%`)
        .order("likes_count", { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: query.trim().length > 0 && activeTab === "posts",
    staleTime: 10000,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, media_urls, thumbnail_url, type, views_count")
        .eq("is_draft", false)
        .not("media_urls", "is", null)
        .order("likes_count", { ascending: false })
        .limit(30);
      return data || [];
    },
    staleTime: 60000,
  });

  const isFetching = activeTab === "users" ? fetchingUsers : fetchingPosts;

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 px-4 pt-2 pb-2 bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users or posts..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        {query.trim() && (
          <div className="flex gap-2 mt-2">
            {(["users", "posts"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}>
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>

      {query.trim() ? (
        <div>
          {isFetching && (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {activeTab === "users" && !fetchingUsers && (
            <div>
              {users.length === 0 && <p className="text-center text-muted-foreground text-sm py-12">No users found</p>}
              {users.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => navigate(`/user/${u.user_id}`)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-card/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground truncate">{u.display_name || u.username}</span>
                      {u.verification_type && u.verification_type !== "none" && <span className="text-xs">✓</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">@{u.username} · {u.followers_count ?? 0} followers</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "posts" && !fetchingPosts && (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm py-12">No posts found</p>}
              {posts.map((post) => {
                const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
                return (
                  <div key={post.id} className="aspect-square bg-card relative">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center p-2">
                        <p className="text-[10px] text-muted-foreground line-clamp-3">{post.caption}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-foreground">Trending</h2>
          <div className="grid grid-cols-3 gap-0.5">
            {trending.map((post) => {
              const mediaUrl = post.media_urls?.[0] || post.thumbnail_url;
              return (
                <div key={post.id} className="aspect-square bg-card relative">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
              );
            })}
            {trending.length === 0 && <p className="col-span-3 text-center text-muted-foreground text-sm py-12">No trending posts</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
