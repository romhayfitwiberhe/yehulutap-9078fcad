import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username || !displayName || !birthday || !gender) {
      return toast.error("Please fill in all fields");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    // Age check (min 13)
    const birthDate = new Date(birthday);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      return toast.error("You must be at least 13 years old");
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          display_name: displayName,
          birthday,
          gender,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account!");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="px-4 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col px-8 pt-4 pb-8 overflow-y-auto"
      >
        <h1 className="text-3xl font-bold text-foreground mb-1">Create Account</h1>
        <p className="text-muted-foreground mb-6">Join the community</p>

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="username"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Birthday</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Gender</label>
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 h-12 rounded-xl font-medium text-sm border transition-colors ${
                    gender === g
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
