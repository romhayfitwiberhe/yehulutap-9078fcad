import { useState, useRef } from "react";
import { ChevronRight, Type, Camera, Image, FileVideo, Video, Loader2, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia, compressImage, generateVideoThumbnail } from "@/lib/media";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type CreateMode = "pick" | "post" | "story" | "text-post";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<CreateMode>("pick");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyMode, setStoryMode] = useState<"text" | "media">("text");

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pb-28">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to create content</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">Sign In</button>
        </div>
      </div>
    );
  }

  const pickFile = (accept: string, forStory = false) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const isVideo = file.type.startsWith("video");
        setMediaFile(file);
        setMediaType(isVideo ? "video" : "image");
        setMediaPreview(URL.createObjectURL(file));
        if (forStory) {
          setStoryMode("media");
          setMode("story");
        } else {
          setMode("post");
        }
      };
      fileInputRef.current.click();
    }
  };

  const publishPost = async () => {
    setUploading(true);
    try {
      if (mode === "text-post") {
        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          type: "text",
          caption: caption.trim() || null,
          audience: "public",
          is_draft: false,
        });
        if (error) throw error;
      } else if (mediaFile) {
        let url: string;
        let thumbnailUrl: string | null = null;

        if (mediaType === "image") {
          const compressed = await compressImage(mediaFile);
          url = await uploadMedia(compressed, "posts");
        } else {
          url = await uploadMedia(mediaFile, "posts");
          try {
            const thumb = await generateVideoThumbnail(mediaFile);
            thumbnailUrl = await uploadMedia(thumb, "thumbnails");
          } catch {}
        }

        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          type: mediaType === "video" ? "video" : "image",
          media_urls: [url],
          thumbnail_url: thumbnailUrl,
          caption: caption.trim() || null,
          audience: "public",
          is_draft: false,
        });
        if (error) throw error;
      }

      toast.success("Post published!");
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      resetState();
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    } finally {
      setUploading(false);
    }
  };

  const publishStory = async () => {
    setUploading(true);
    try {
      let mediaUrl: string | null = null;
      let type = "text";

      if (storyMode === "media" && mediaFile) {
        if (mediaType === "image") {
          const compressed = await compressImage(mediaFile);
          mediaUrl = await uploadMedia(compressed, "stories");
          type = "image";
        } else {
          mediaUrl = await uploadMedia(mediaFile, "stories");
          type = "video";
        }
      }

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        type,
        content: storyMode === "text" ? storyText.trim() : null,
        media_url: mediaUrl,
        caption: storyMode === "media" ? caption.trim() || null : null,
        audience: "public",
      });
      if (error) throw error;

      toast.success("Story posted!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      resetState();
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to post story");
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setMode("pick");
    setMediaFile(null);
    setMediaPreview(null);
    setCaption("");
    setStoryText("");
    setStoryMode("text");
  };

  // Text post composer
  if (mode === "text-post") {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 h-[52px] border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <button onClick={resetState}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <span className="text-lg font-bold text-foreground">New Post</span>
          <button onClick={publishPost} disabled={uploading || !caption.trim()} className="text-sm font-bold text-primary disabled:opacity-50">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Share"}
          </button>
        </header>
        <div className="flex-1 p-4">
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Share your thoughts..." rows={8}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-base resize-none focus:outline-none" autoFocus />
        </div>
      </div>
    );
  }

  // Post composer
  if (mode === "post" && mediaPreview) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 h-[52px] border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <button onClick={resetState}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <span className="text-lg font-bold text-foreground">New Post</span>
          <button onClick={publishPost} disabled={uploading} className="text-sm font-bold text-primary disabled:opacity-50">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Share"}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl overflow-hidden bg-card mb-4" style={{ maxHeight: "50vh" }}>
            {mediaType === "video" ? (
              <video src={mediaPreview} className="w-full object-contain" style={{ maxHeight: "50vh" }} controls playsInline />
            ) : (
              <img src={mediaPreview} alt="" className="w-full object-contain" style={{ maxHeight: "50vh" }} />
            )}
          </div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." rows={4}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none border border-border rounded-xl p-3" />
        </div>
      </div>
    );
  }

  // Story composer
  if (mode === "story") {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 h-[52px] border-b border-border" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <button onClick={resetState}><ArrowLeft className="w-6 h-6 text-foreground" /></button>
          <span className="text-lg font-bold text-foreground">New Story</span>
          <button onClick={publishStory} disabled={uploading || (storyMode === "text" && !storyText.trim())} className="text-sm font-bold text-primary disabled:opacity-50">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post"}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-2 px-4 pt-4">
            <button onClick={() => setStoryMode("text")} className={`flex-1 py-2 rounded-lg text-sm font-medium ${storyMode === "text" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"}`}>Text</button>
            <button onClick={() => pickFile("image/*,video/*", true)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${storyMode === "media" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"}`}>Photo/Video</button>
          </div>
          {storyMode === "text" ? (
            <div className="p-4">
              <div className="w-full aspect-[9/16] bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center p-6">
                <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="Type your story..."
                  className="w-full text-center bg-transparent text-white text-xl font-bold placeholder:text-white/50 resize-none focus:outline-none" rows={6} />
              </div>
            </div>
          ) : mediaPreview ? (
            <div className="p-4 space-y-4">
              <div className="rounded-xl overflow-hidden bg-card" style={{ maxHeight: "60vh" }}>
                {mediaType === "video" ? (
                  <video src={mediaPreview} className="w-full object-contain" style={{ maxHeight: "60vh" }} controls playsInline />
                ) : (
                  <img src={mediaPreview} alt="" className="w-full object-contain" style={{ maxHeight: "60vh" }} />
                )}
              </div>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption..."
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
            </div>
          ) : (
            <div className="flex items-center justify-center pt-20">
              <p className="text-muted-foreground text-sm">Select a photo or video</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create picker - matching screenshot
  const options = [
    { icon: Type, label: "Text", desc: "Share your thoughts", color: "bg-blue-600", action: () => setMode("text-post") },
    { icon: Camera, label: "Take Photo", desc: "Open camera", color: "bg-teal-500", action: () => pickFile("image/*;capture=camera") },
    { icon: Image, label: "Gallery", desc: "Pick photos from gallery", color: "bg-purple-500", action: () => pickFile("image/*") },
    { icon: FileVideo, label: "Upload Video", desc: "From gallery", color: "bg-pink-500", action: () => pickFile("video/*") },
    { icon: Video, label: "Record Video", desc: "Record Video", color: "bg-primary", action: () => pickFile("video/*;capture=camcorder") },
  ];

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <input ref={fileInputRef} type="file" className="hidden" />
      <div className="px-4 pt-6" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
        <h1 className="text-2xl font-bold text-foreground">Create</h1>
        <p className="text-sm text-muted-foreground mt-1">What would you like to share?</p>
      </div>

      <div className="px-4 mt-6 space-y-3">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.action}
            className="flex items-center gap-4 w-full p-4 rounded-2xl bg-card hover:bg-card/80 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl ${opt.color} flex items-center justify-center`}>
              <opt.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Upload;
