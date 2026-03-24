import { useState } from "react";
import { ArrowLeft, ChevronRight, Bell, Lock, Eye, Shield, LogOut, HelpCircle, Moon, User, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const { user, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", action: () => navigate("/edit-profile") },
        { icon: Lock, label: "Private Account", toggle: true, key: "private_account", value: prefs?.private_account ?? false },
      ],
    },
    {
      title: "Privacy",
      items: [
        { icon: Eye, label: "Show Online Status", toggle: true, key: "show_online_status", value: prefs?.show_online_status ?? true },
        { icon: Shield, label: "Allow Messages", toggle: true, key: "allow_messages", value: prefs?.allow_messages ?? true },
        { icon: Shield, label: "Allow Comments", toggle: true, key: "allow_comments", value: prefs?.allow_comments ?? true },
      ],
    },
    {
      title: "Notifications",
      items: [
        { icon: Bell, label: "Likes", toggle: true, key: "notif_likes", value: prefs?.notif_likes ?? true },
        { icon: Bell, label: "Comments", toggle: true, key: "notif_comments", value: prefs?.notif_comments ?? true },
        { icon: Bell, label: "Follows", toggle: true, key: "notif_follows", value: prefs?.notif_follows ?? true },
        { icon: Bell, label: "Messages", toggle: true, key: "notif_messages", value: prefs?.notif_messages ?? true },
        { icon: Bell, label: "Gifts", toggle: true, key: "notif_gifts", value: prefs?.notif_gifts ?? true },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Settings</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mt-4">
            <h3 className="px-4 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
            <div className="border-t border-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.toggle && item.key) {
                      togglePref(item.key, !item.value);
                    } else if (item.action) {
                      item.action();
                    }
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 border-b border-border hover:bg-card/50 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-sm text-foreground text-left">{item.label}</span>
                  {item.toggle ? (
                    <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${item.value ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
                      <div className="w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 px-4 pb-8">
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full py-3 text-destructive">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
