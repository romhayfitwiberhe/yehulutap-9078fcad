import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type AuthMode = "welcome" | "email" | "phone";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  if (mode === "email") {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <div className="px-4 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
          <button onClick={() => setMode("welcome")} className="flex items-center gap-2 text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center px-8 -mt-12">
          <h1 className="text-2xl font-bold text-foreground mb-1">Sign In with Email</h1>
          <p className="text-muted-foreground text-sm mb-8">Enter your email and password</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">PASSWORD</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 px-4 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground rounded-full font-semibold text-base disabled:opacity-50 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="text-primary font-semibold">Sign Up</button>
          </p>
        </motion.div>
      </div>
    );
  }

  // Welcome screen
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full max-w-sm">
        {/* Logo */}
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary via-orange-400 to-pink-300 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-5xl font-black text-white" style={{ fontFamily: "serif" }}>y</span>
        </div>

        <h1 className="text-3xl font-black text-foreground mb-0">
          Yehulu<span className="text-primary">Tap</span>
        </h1>
        <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground mt-1 mb-8">
          <span className="text-primary">SHARE</span> · CREATE · <span className="text-primary">EARN</span>
        </p>

        <h2 className="text-2xl font-bold text-foreground mb-1">Welcome</h2>
        <p className="text-muted-foreground text-sm mb-8">Sign in or create your account</p>

        {/* Continue with Phone */}
        <button
          onClick={() => toast.info("Phone login coming soon")}
          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-3 mb-3"
        >
          <Phone className="w-5 h-5" />
          Continue with Phone
        </button>

        {/* Continue with Email */}
        <button
          onClick={() => setMode("email")}
          className="w-full h-14 rounded-full bg-card border border-border text-foreground font-semibold text-base flex items-center justify-center gap-3 mb-6"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth */}
        <div className="flex gap-3 w-full mb-6">
          <button onClick={() => handleOAuth("google")} className="flex-1 h-12 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground font-medium text-sm">
            <span className="text-lg">G</span> Google
          </button>
          <button onClick={() => handleOAuth("facebook")} className="flex-1 h-12 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground font-medium text-sm">
            <span className="text-lg text-blue-500">f</span> Facebook
          </button>
        </div>

        {/* Browse as Guest */}
        <button onClick={() => navigate("/")} className="text-sm text-muted-foreground mb-4">
          Browse as Guest →
        </button>

        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="text-primary font-semibold">Sign Up</button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
