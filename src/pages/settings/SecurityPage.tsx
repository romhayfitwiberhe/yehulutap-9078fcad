import { ArrowLeft, ChevronRight, Wifi, Fingerprint, ShieldCheck, Smartphone, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const SecurityPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pinEnabled, setPinEnabled] = useState(false);

  const { data: prefs } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("user_preferences").select("show_online_status").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const toggleOnlineStatus = async () => {
    if (!user) return;
    const newVal = !(prefs?.show_online_status ?? true);
    await supabase.from("user_preferences").update({ show_online_status: newVal }).eq("user_id", user.id);
    queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
  };

  const handleLogOutAll = async () => {
    toast.info("All devices logged out");
  };

  const handleChangePassword = () => {
    toast.info("Password reset email sent");
  };

  const onlineStatus = prefs?.show_online_status ?? true;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Security</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Visibility */}
        <h3 className="px-4 pt-5 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Wifi className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">Show Online Status</span>
            <button onClick={toggleOnlineStatus} className={`w-11 h-6 rounded-full transition-colors flex items-center ${onlineStatus ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
              <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
            </button>
          </div>
        </div>

        {/* App Lock */}
        <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">App Lock</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Fingerprint className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground">PIN Lock</span>
            <span className="text-xs text-muted-foreground mr-2">{pinEnabled ? "On" : "Off"}</span>
            <button onClick={() => setPinEnabled(!pinEnabled)} className={`w-11 h-6 rounded-full transition-colors flex items-center ${pinEnabled ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
              <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
            </button>
          </div>
        </div>

        {/* Verification */}
        <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verification</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <button className="flex items-center gap-3 w-full px-4 py-3.5">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Verify Your Account</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Sessions */}
        <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sessions</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <button className="flex items-center gap-3 w-full px-4 py-3.5 border-b border-border">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Active Sessions</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={handleLogOutAll} className="w-full py-3 text-sm font-medium text-destructive">
            Log Out All Devices
          </button>
        </div>

        {/* Password */}
        <h3 className="px-4 pt-6 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</h3>
        <div className="mx-4 rounded-xl bg-card overflow-hidden">
          <button onClick={handleChangePassword} className="flex items-center gap-3 w-full px-4 py-3.5">
            <Key className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Change Password</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
