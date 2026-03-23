import { Home, Play, PlusSquare, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/videos", icon: Play, label: "Videos" },
  { path: "/upload", icon: PlusSquare, label: "" },
  { path: "/inbox", icon: MessageCircle, label: "Inbox" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isVideosPage = location.pathname === "/videos";

  if (isVideosPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-[52px]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isCreate = tab.path === "/upload";

          if (isCreate) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex items-center justify-center w-11 h-8 bg-primary rounded-lg"
              >
                <PlusSquare className="w-5 h-5 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[48px]"
            >
              <tab.icon
                className={`w-6 h-6 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                fill={isActive ? "currentColor" : "none"}
              />
              {tab.label && (
                <span className={`text-[10px] ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
