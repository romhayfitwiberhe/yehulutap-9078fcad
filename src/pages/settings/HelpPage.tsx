import { ArrowLeft, MessageCircle, FileText, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Help Center</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="mx-4 mt-4 space-y-2">
          <button onClick={() => toast.info("Coming soon")} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Contact Support</p>
              <p className="text-xs text-muted-foreground">Get help from our team</p>
            </div>
          </button>
          <button onClick={() => toast.info("Coming soon")} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">FAQ</p>
              <p className="text-xs text-muted-foreground">Frequently asked questions</p>
            </div>
          </button>
          <button onClick={() => toast.info("Coming soon")} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-card">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Report a Problem</p>
              <p className="text-xs text-muted-foreground">Let us know about issues</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
