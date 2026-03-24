import { useState } from "react";
import { X, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NewDMSheet = ({ isOpen, onClose }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [starting, setStarting] = useState<string | null>(null);

  const { data: results = [] } = useQuery({
    queryKey: ["dm-search", query],
    queryFn: async () => {
      if (!query.trim() || !user) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .neq("user_id", user.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(15);
      return data || [];
    },
    enabled: query.trim().length > 0 && !!user,
    staleTime: 10000,
  });

  const startChat = async (otherUserId: string) => {
    if (!user || starting) return;
    setStarting(otherUserId);
    try {
      const { data, error } = await supabase.rpc("create_dm_conversation", {
        _other_user_id: otherUserId,
      });
      if (error) throw error;
      onClose();
      navigate(`/chat/${data}`);
    } catch (err: any) {
      toast.error("Could not start conversation");
    } finally {
      setStarting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={onClose}>
          <X className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">New Message</span>
      </header>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-xl border border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {results.map((u) => (
          <button
            key={u.user_id}
            onClick={() => startChat(u.user_id)}
            disabled={starting === u.user_id}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-card/50 transition-colors disabled:opacity-50"
          >
            <div className="w-11 h-11 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold overflow-hidden">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                u.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{u.display_name || u.username}</p>
              <p className="text-xs text-muted-foreground">@{u.username}</p>
            </div>
          </button>
        ))}
        {query.trim() && results.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">No users found</p>
        )}
      </div>
    </div>
  );
};

export default NewDMSheet;
