import { ArrowLeft, ChevronRight, Wallet, User, Bell, Lock, BarChart3, QrCode, Shield, HelpCircle, Moon, LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const shortId = user.id.substring(0, 8).toUpperCase();

  const menuItems = [
    { icon: Wallet, label: "Balance & Wallet", route: "/settings/wallet" },
    { icon: User, label: "Account", route: "/settings/account" },
    { icon: Bell, label: "Privacy & Notifications", route: "/settings/privacy" },
    { icon: BarChart3, label: "Analytics", route: "/settings/analytics" },
    { icon: QrCode, label: "My QR Code", route: "/settings/qr-code" },
    { icon: Shield, label: "Security", route: "/settings/security" },
    { icon: HelpCircle, label: "Help Center", route: "/settings/help" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Profile card */}
        <button
          onClick={() => navigate("/edit-profile")}
          className="flex items-center gap-3 w-full px-4 py-4 border-b border-border"
        >
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.username ?? "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-foreground">{profile?.display_name ?? "User"}</p>
            <p className="text-xs text-muted-foreground">@{profile?.username ?? "user"}</p>
            <p className="text-[10px] text-muted-foreground">ID: {shortId}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Menu items */}
        <div className="mt-2 space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card hover:bg-card/80 transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Appearance */}
        <div className="mt-6 px-3">
          <h3 className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h3>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card"
          >
            <Moon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Dark Mode</span>
            <div className={`w-11 h-6 rounded-full transition-colors flex items-center ${darkMode ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
              <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
            </div>
          </button>
        </div>

        {/* Bottom actions */}
        <div className="mt-4 px-3 space-y-1">
          <button className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground text-left">Switch Account</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="flex-1 text-sm text-destructive text-left font-medium">Log Out</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 pb-4">
          Yehulu Tap v2.0 • Made with ❤️
        </p>
      </div>
    </div>
  );
};

export default Settings;
