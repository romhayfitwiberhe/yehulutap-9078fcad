import { ArrowLeft, AtSign, Users, Ban, Bell, MessageSquare, UserPlus, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors flex items-center ${value ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
    <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
  </button>
);

const PrivacyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const togglePref = async (key: string, value: boolean) => {
    if (!user) return;
    await supabase.from("user_preferences").update({ [key]: value }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
  };

  const setFollowingVisibility = async (val: string) => {
    if (!user) return;
    await supabase.from("user_preferences").update({ show_following: val }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Privacy & Notifications</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Privacy section */}
        <h3 className="px-4 pt-5 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <AtSign className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">@Mentions</span>
            <Toggle value={prefs?.allow_mentions ?? true} onChange={() => togglePref("allow_mentions", !(prefs?.allow_mentions ?? true))} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">Following List</span>
            <div className="flex gap-1">
              {["public", "only_me"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFollowingVisibility(opt)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    (prefs?.show_following ?? "public") === opt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {opt === "public" ? "Everyone" : "Only Me"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => navigate("/settings/blocked")} className="flex items-center gap-3 w-full px-4 py-3.5">
            <Ban className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Blocked Accounts</span>
            <span className="text-xs text-muted-foreground mr-1">›</span>
          </button>
        </div>

        {/* Notifications section */}
        <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          {[
            { icon: Bell, label: "Likes", key: "notif_likes" },
            { icon: MessageSquare, label: "Comments", key: "notif_comments" },
            { icon: UserPlus, label: "New Follows", key: "notif_follows" },
            { icon: Mail, label: "Direct Messages", key: "notif_messages" },
          ].map((item, i, arr) => (
            <div key={item.key} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">{item.label}</span>
              <Toggle
                value={(prefs as any)?.[item.key] ?? true}
                onChange={() => togglePref(item.key, !((prefs as any)?.[item.key] ?? true))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
