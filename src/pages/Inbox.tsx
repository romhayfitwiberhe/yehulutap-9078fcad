import { Search, Edit } from "lucide-react";

const mockChats = [
  { id: "1", name: "Alex Developer", lastMsg: "Hey! Check out this new feature 🚀", time: "2m", unread: 2, online: true },
  { id: "2", name: "Sara Miller", lastMsg: "That video was amazing!", time: "15m", unread: 0, online: true },
  { id: "3", name: "Mike Photo", lastMsg: "Let's collab on something", time: "1h", unread: 1, online: false },
  { id: "4", name: "Luna Art", lastMsg: "Thanks for the follow! 💕", time: "3h", unread: 0, online: false },
  { id: "5", name: "John Fitness", lastMsg: "Workout routine posted", time: "5h", unread: 0, online: true },
  { id: "6", name: "Emma Cook", lastMsg: "Recipe video is up!", time: "1d", unread: 0, online: false },
];

const Inbox = () => {
  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-lg font-bold text-foreground">Messages</h1>
        <button><Edit className="w-5 h-5 text-primary" /></button>
      </header>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search messages</span>
        </div>
      </div>

      {/* Chat list */}
      <div>
        {mockChats.map((chat) => (
          <button
            key={chat.id}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-card/50 transition-colors"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-muted-foreground font-semibold">
                {chat.name.charAt(0)}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${chat.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                  {chat.name}
                </span>
                <span className={`text-[11px] ${chat.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {chat.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-[13px] truncate ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {chat.lastMsg}
                </p>
                {chat.unread > 0 && (
                  <span className="ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
