import { ArrowLeft, ChevronRight, User, Lock, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AccountPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("user_preferences").select("private_account").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const togglePrivate = async () => {
    if (!user) return;
    const newVal = !(prefs?.private_account ?? false);
    await supabase.from("user_preferences").update({ private_account: newVal }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Account</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="mx-4 mt-4 space-y-2">
          <button onClick={() => navigate("/edit-profile")} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Edit Profile</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">Private Account</span>
            <button onClick={togglePrivate} className={`w-11 h-6 rounded-full transition-colors flex items-center ${prefs?.private_account ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
              <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
            </button>
          </div>
          <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "Not set"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
