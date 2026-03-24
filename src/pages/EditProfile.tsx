import { useState, useRef } from "react";
import { ArrowLeft, Camera } from "lucide-react";
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

  // Initialize form once profile loads
  const displayName = form.display_name ?? profile?.display_name ?? "";
  const username = form.username ?? profile?.username ?? "";
  const bio = form.bio ?? profile?.bio ?? "";
  const website = form.website ?? profile?.website ?? "";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const compressed = await compressImage(file, 400);
      const ext = "jpg";
      const path = `avatars/${user.id}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, compressed);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error("Failed to update avatar");
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      if (form.display_name !== undefined) updates.display_name = form.display_name;
      if (form.username !== undefined) updates.username = form.username;
      if (form.bio !== undefined) updates.bio = form.bio;
      if (form.website !== undefined) updates.website = form.website;

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

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 h-[52px] border-b border-border bg-background flex-shrink-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button onClick={() => navigate(-1 as any)}>
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <span className="text-base font-bold text-foreground">Edit Profile</span>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold text-primary disabled:opacity-50">
          {saving ? "..." : "Save"}
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center text-3xl font-bold text-muted-foreground border-2 border-border overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile?.username ?? "U").charAt(0).toUpperCase()
                )}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Fields */}
          {[
            { label: "Display Name", key: "display_name", value: displayName, maxLen: 50 },
            { label: "Username", key: "username", value: username, maxLen: 30 },
            { label: "Bio", key: "bio", value: bio, maxLen: 150, multiline: true },
            { label: "Website", key: "website", value: website, maxLen: 100 },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
              {field.multiline ? (
                <textarea
                  value={field.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  maxLength={field.maxLen}
                  rows={3}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              ) : (
                <input
                  value={field.value}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  maxLength={field.maxLen}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditProfile;
