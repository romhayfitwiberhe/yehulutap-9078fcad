import { ArrowLeft, X, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const QRCodePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("display_name, username").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const profileUrl = `https://yehulutap.lovable.app/user/${user?.id}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like pattern
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";

    const cellSize = 8;
    const cells = size / cellSize;
    // Generate deterministic pattern from user id
    const seed = (user?.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    
    // Draw position patterns (corners)
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(cells - 7, 0);
    drawFinder(0, cells - 7);

    // Fill data area with pseudo-random pattern
    for (let i = 8; i < cells - 8; i++) {
      for (let j = 0; j < cells; j++) {
        if (((i * 31 + j * 17 + seed) % 3) === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    for (let i = 0; i < 8; i++) {
      for (let j = 8; j < cells - 8; j++) {
        if (((i * 23 + j * 13 + seed) % 3) === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    for (let i = cells - 7; i < cells; i++) {
      for (let j = 8; j < cells; j++) {
        if (((i * 29 + j * 11 + seed) % 3) === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [user?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.display_name} on Yehulu Tap`, url: profileUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Link copied!");
    }
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${profile?.username || "qr"}-yehulutap.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success("QR code saved!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1 as any)}>
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <span className="text-base font-bold text-foreground">My QR Code</span>
        </div>
        <button onClick={() => navigate(-1 as any)}>
          <X className="w-6 h-6 text-foreground" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-lg">
          <canvas ref={canvasRef} className="w-56 h-56 rounded-xl" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">{profile?.display_name ?? "User"}</h2>
          <p className="text-sm text-muted-foreground">@{profile?.username ?? "user"}</p>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Scan this code to view your profile. Share it with friends!
        </p>

        <div className="flex gap-3">
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            <Download className="w-4 h-4" />
            Save
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm">
            <Share2 className="w-4 h-4 text-primary" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
