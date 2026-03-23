import { Camera, Image, FileVideo, Music } from "lucide-react";

const Upload = () => {
  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-40 flex items-center justify-center h-[52px] bg-background border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <h1 className="text-lg font-bold text-foreground">Create</h1>
      </header>

      <div className="flex flex-col items-center justify-center gap-8 px-6 pt-16">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-10 h-10 text-primary" />
        </div>
        <p className="text-muted-foreground text-center text-sm">Share your moments with the world</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { icon: FileVideo, label: "Video", desc: "Record or upload" },
            { icon: Image, label: "Photo", desc: "Camera or gallery" },
            { icon: Camera, label: "Story", desc: "24hr content" },
            { icon: Music, label: "Live", desc: "Go live now" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <item.icon className="w-7 h-7 text-primary" />
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
              <span className="text-[11px] text-muted-foreground">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upload;
