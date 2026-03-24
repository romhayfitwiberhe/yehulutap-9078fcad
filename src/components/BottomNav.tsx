import { Home, Play, Plus, MessageSquare, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/videos", icon: Play, label: "Videos" },
  { path: "/upload", icon: Plus, label: "" },
  { path: "/inbox", icon: MessageSquare, label: "Inbox" },
  { path: "/profile", icon: User, label: "Profile" },
];

const hiddenPaths = ["/videos", "/login", "/signup", "/edit-profile", "/settings"];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith("/chat/") || location.pathname.startsWith("/settings/"))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-[52px]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isCreate = tab.path === "/upload";

          if (isCreate) {
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} className="flex items-center justify-center w-12 h-9 bg-primary rounded-lg">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className="flex flex-col items-center justify-center gap-0.5 min-w-[48px]">
              <tab.icon className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} fill={isActive && tab.path !== "/upload" ? "currentColor" : "none"} />
              {tab.label && (
                <span className={`text-[10px] ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>{tab.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
