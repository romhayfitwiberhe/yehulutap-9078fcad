import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, ChevronDown, Check } from "lucide-react";
import { motion } from "framer-motion";

const Signup = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !gender || !birthday || !password || !confirmPassword) {
      return toast.error("Please fill in all required fields");
    }
    if (!passwordValid) return toast.error("Password must be at least 8 characters");
    if (!passwordsMatch) return toast.error("Passwords do not match");
    if (!agreedToTerms) return toast.error("Please agree to the Terms of Service");

    const birthDate = new Date(birthday);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) return toast.error("You must be at least 13 years old");

    const username = displayName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user" + Date.now();

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

  const handleOAuth = async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <div className="px-4 pt-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col px-6 pt-4 pb-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-0.5">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-5">Join the YehuluTap community</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name */}
          <FieldLabel label="FULL NAME">
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </FieldLabel>

          {/* Email */}
          <FieldLabel label="EMAIL ADDRESS">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </FieldLabel>

          {/* Phone */}
          <FieldLabel label="PHONE NUMBER">
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 h-12 rounded-xl bg-card border border-border text-foreground text-sm shrink-0">
                <span>🇪🇹</span>
                <span>+251</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="flex-1 h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </FieldLabel>

          {/* Gender */}
          <FieldLabel label="GENDER *">
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 h-12 rounded-xl font-medium text-sm border transition-colors flex items-center justify-center gap-1.5 ${
                    gender === g
                      ? "border-primary text-primary bg-primary/10"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  <span className="text-xs">{g === "Male" ? "♂" : "♀"}</span> {g}
                </button>
              ))}
            </div>
          </FieldLabel>

          {/* Date of Birth */}
          <FieldLabel label="DATE OF BIRTH *">
            <div className="relative">
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </FieldLabel>

          {/* Password */}
          <FieldLabel label="PASSWORD">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full h-12 px-4 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
              </button>
            </div>
          </FieldLabel>

          {/* Confirm Password */}
          <FieldLabel label="CONFIRM PASSWORD">
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </FieldLabel>

          {/* Validation hints */}
          {password.length > 0 && (
            <div className="bg-card rounded-xl px-4 py-3 space-y-1">
              <ValidationItem valid={passwordValid} label="At least 8 characters" />
              <ValidationItem valid={passwordsMatch} label="Passwords match" />
            </div>
          )}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <button type="button" onClick={() => setAgreedToTerms(!agreedToTerms)} className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${agreedToTerms ? "bg-primary border-primary" : "border-border bg-card"}`}>
              {agreedToTerms && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <span className="text-sm text-muted-foreground">
              I agree to the <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span>
            </span>
          </label>

          <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground rounded-full font-semibold text-base disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth */}
        <div className="flex gap-3 w-full mb-5">
          <button onClick={() => handleOAuth("google")} className="flex-1 h-12 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground font-medium text-sm">
            <span className="text-lg">G</span> Google
          </button>
          <button onClick={() => handleOAuth("facebook")} className="flex-1 h-12 rounded-xl bg-card border border-border flex items-center justify-center gap-2 text-foreground font-medium text-sm">
            <span className="text-lg text-blue-500">f</span> Facebook
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">Log In</button>
        </p>
      </motion.div>
    </div>
  );
};

const FieldLabel = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
    {children}
  </div>
);

const ValidationItem = ({ valid, label }: { valid: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${valid ? "bg-green-500" : "bg-muted-foreground"}`} />
    <span className={`text-sm ${valid ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
  </div>
);

export default Signup;
