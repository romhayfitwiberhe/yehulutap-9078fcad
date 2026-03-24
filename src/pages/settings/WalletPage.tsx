import { ArrowLeft, ShoppingCart, ArrowUpRight, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const WalletPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("wallets").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
    enabled: !!user && activeTab === "transactions",
  });

  const balance = wallet?.balance ?? 0;
  const earnings = wallet?.earnings ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Wallet</span>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Balance card */}
        <div className="mx-4 mt-4 rounded-2xl p-5 bg-gradient-to-br from-primary via-primary/90 to-primary/70 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-12 right-8 w-16 h-16 rounded-full bg-white/5" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/80 text-xs">Your Coins</p>
              <div className="flex items-center gap-2 mt-1">
                <Coins className="w-6 h-6 text-white/80" />
                <span className="text-3xl font-bold text-white">{balance}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs">Earnings</p>
              <p className="text-xl font-bold text-white mt-1">{earnings} Coins</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 bg-white/15 rounded-lg px-3 py-1.5 w-fit relative z-10">
            <span className="text-white text-xs">⇄ 1 Coin = 10 ETB</span>
          </div>

          <div className="flex gap-3 mt-4 relative z-10">
            <button
              onClick={() => toast.info("Coming soon")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Buy Coins</span>
            </button>
            <button
              onClick={() => toast.info("Coming soon")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-4 mt-5 flex rounded-xl bg-card overflow-hidden">
          {(["overview", "transactions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}
            >
              {tab === "overview" ? "Overview" : "Transactions"}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="mx-4 mt-4 rounded-xl bg-card p-4 space-y-1">
            <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
            <button
              onClick={() => toast.info("Coming soon")}
              className="flex items-center gap-3 w-full py-3 border-b border-border"
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Buy Coins</p>
                <p className="text-xs text-muted-foreground">Purchase coin packages</p>
              </div>
            </button>
            <button
              onClick={() => toast.info("Coming soon")}
              className="flex items-center gap-3 w-full py-3"
            >
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Withdraw</p>
                <p className="text-xs text-muted-foreground">Request a coin withdrawal</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="mx-4 mt-4 space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-12">No transactions yet</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-card">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-500" : "text-destructive"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
