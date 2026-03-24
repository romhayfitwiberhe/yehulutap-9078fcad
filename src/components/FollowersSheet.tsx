import { useState } from "react";
import { X, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface FollowersSheetProps {
  userId: string;
  initialTab: "followers" | "following";
  open: boolean;
  onClose: () => void;
}

const FollowersSheet = ({ userId, initialTab, open, onClose }: FollowersSheetProps) => {
  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: followers = [] } = useQuery({
    queryKey: ["followers-list", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);
      if (!data || data.length === 0) return [];
      const ids = data.map((f) => f.follower_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, verification_type")
        .in("user_id", ids);
      return profiles || [];
    },
    enabled: open,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["following-list", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      if (!data || data.length === 0) return [];
      const ids = data.map((f) => f.following_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url, verification_type")
        .in("user_id", ids);
      return profiles || [];
    },
    enabled: open,
  });

  const { data: myFollowing = [] } = useQuery({
    queryKey: ["my-following-ids", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      return data?.map((f) => f.following_id) || [];
    },
    enabled: open && !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const isFollowing = myFollowing.includes(targetId);
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user!.id).eq("following_id", targetId);
      } else {
        await supabase.from("follows").insert({ follower_id: user!.id, following_id: targetId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-following-ids"] });
      queryClient.invalidateQueries({ queryKey: ["followers-list"] });
      queryClient.invalidateQueries({ queryKey: ["following-list"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });

  const list = tab === "followers" ? followers : following;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl max-h-[75dvh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-base font-bold text-foreground">Connections</span>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["followers", "following"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  {t === "followers" ? `Followers (${followers.length})` : `Following (${following.length})`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {list.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground text-sm">
                    {tab === "followers" ? "No followers yet" : "Not following anyone"}
                  </p>
                </div>
              ) : (
                list.map((p) => {
                  const isMe = p.user_id === user?.id;
                  const amFollowing = myFollowing.includes(p.user_id);
                  const isVerified = p.verification_type && p.verification_type !== "none";
                  const badge = p.verification_type === "gold" ? "🟡" : p.verification_type === "blue" ? "🔵" : "";

                  return (
                    <div key={p.user_id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => { onClose(); navigate(`/user/${p.user_id}`); }}
                        className="w-11 h-11 rounded-full bg-card overflow-hidden flex-shrink-0"
                      >
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                            {(p.username ?? "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => { onClose(); navigate(`/user/${p.user_id}`); }}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                          {p.display_name} {isVerified && <span className="text-xs">{badge}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{p.username}</p>
                      </button>
                      {!isMe && user && (
                        <button
                          onClick={() => followMutation.mutate(p.user_id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            amFollowing
                              ? "bg-card border border-border text-foreground"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {amFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FollowersSheet;
