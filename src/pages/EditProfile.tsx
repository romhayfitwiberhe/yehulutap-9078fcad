import { useState, useRef } from "react";
import { ArrowLeft, Camera, ChevronRight, ChevronDown, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/lib/media";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const [form, setForm] = useState<Record<string, string>>({});

  const getValue = (key: string) => form[key] ?? (profile as any)?.[key] ?? "";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const compressed = await compressImage(file, 400);
      const path = `avatars/${user.id}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, compressed);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to update avatar");
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {};
      const fields = ["display_name", "username", "bio", "gender", "website", "contact_phone", "birthday"];
      fields.forEach((key) => {
        if (form[key] !== undefined) updates[key] = form[key];
      });

      if (Object.keys(updates).length === 0) {
        navigate(-1 as any);
        return;
      }

      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profile updated");
      navigate(-1 as any);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    const newPass = form.new_password;
    const confirmPass = form.confirm_password;
    if (!newPass || newPass.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPass !== confirmPass) return toast.error("Passwords do not match");
    
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setForm(prev => ({ ...prev, new_password: "", confirm_password: "" }));
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const gender = getValue("gender");

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Edit Profile</span>
        <button onClick={handleSave} disabled={saving} className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
          {saving ? "..." : "Save"}
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[3px] border-primary p-0.5">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-3xl font-bold text-muted-foreground overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.username ?? "U").charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <button onClick={() => fileRef.current?.click()} className="text-sm font-medium text-primary">Change Photo</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name */}
          <FieldGroup label="NAME">
            <input value={getValue("display_name")} onChange={(e) => setForm(p => ({ ...p, display_name: e.target.value }))} maxLength={50} className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground outline-none" />
          </FieldGroup>

          {/* Username */}
          <FieldGroup label="USERNAME">
            <input value={getValue("username")} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} maxLength={30} className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground outline-none" />
            <p className="text-[11px] text-muted-foreground mt-1">yehulu.app/@{getValue("username")}</p>
          </FieldGroup>

          {/* Bio */}
          <FieldGroup label="BIO">
            <textarea value={getValue("bio")} onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))} maxLength={150} rows={3} className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground outline-none resize-none" />
          </FieldGroup>

          {/* Gender */}
          <FieldGroup label="GENDER">
            <div className="flex gap-3">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setForm(p => ({ ...p, gender: g }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    gender === g
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground bg-card"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Website */}
          <FieldGroup label="WEBSITE">
            <input value={getValue("website")} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))} placeholder="www.example.com" className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </FieldGroup>

          {/* Social Links */}
          <FieldGroup label="SOCIAL LINKS">
            <div className="space-y-0">
              {[
                { icon: "📷", placeholder: "instagram.com/username" },
                { icon: "🎵", placeholder: "tiktok.com/@username" },
                { icon: "📺", placeholder: "youtube.com/@channel" },
                { icon: "📘", placeholder: "facebook.com/username" },
                { icon: "✈️", placeholder: "t.me/username" },
              ].map((link, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-3 border-b border-border last:border-b-0">
                  <span className="text-base">{link.icon}</span>
                  <span className="text-sm text-muted-foreground">{link.placeholder}</span>
                </div>
              ))}
            </div>
          </FieldGroup>

          {/* Contact Phone */}
          <FieldGroup label="CONTACT PHONE">
            <input value={getValue("contact_phone")} onChange={(e) => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="+251 9XX XXX XXXX" className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </FieldGroup>

          {/* Links */}
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Links</span>
            </div>
            <button className="flex items-center gap-1 text-sm text-muted-foreground">
              Add <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Update Password */}
          <FieldGroup label="UPDATE PASSWORD">
            <input
              type="password"
              value={form.new_password ?? ""}
              onChange={(e) => setForm(p => ({ ...p, new_password: e.target.value }))}
              placeholder="New password"
              className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none mb-2"
            />
            <input
              type="password"
              value={form.confirm_password ?? ""}
              onChange={(e) => setForm(p => ({ ...p, confirm_password: e.target.value }))}
              placeholder="Confirm password"
              className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button onClick={handlePasswordUpdate} className="w-full mt-3 py-2.5 rounded-lg bg-primary/20 text-primary text-sm font-semibold">
              Update Password
            </button>
          </FieldGroup>

          {/* Business Info */}
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">BUSINESS INFO</p>
            <div className="bg-card rounded-lg overflow-hidden">
              <button className="flex items-center justify-between w-full px-3 py-3 border-b border-border">
                <span className="text-sm text-foreground">Action buttons</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full px-3 py-3 border-b border-border">
                <span className="text-sm text-foreground">Leads</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{profile?.leads_enabled ? "On" : "Off"}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
              <button className="flex items-center justify-between w-full px-3 py-3">
                <span className="text-sm text-foreground">Category</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{profile?.profession_category || "Select"}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <FieldGroup label="DATE OF BIRTH">
            <div className="relative">
              <input
                type="date"
                value={getValue("birthday")}
                onChange={(e) => setForm(p => ({ ...p, birthday: e.target.value }))}
                className="w-full px-3 py-3 bg-card rounded-lg text-sm text-foreground outline-none appearance-none"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </FieldGroup>

          <div className="h-8" />
        </div>
      )}
    </div>
  );
};

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
    {children}
  </div>
);

export default EditProfile;
