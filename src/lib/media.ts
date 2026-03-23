import { supabase } from "@/integrations/supabase/client";

export const uploadMedia = async (file: File, folder: string = "posts"): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(fileName);
  return data.publicUrl;
};

export const compressImage = (file: File, maxSize = 2048, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    if (file.size < 200 * 1024) return resolve(file);

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
};

export const generateVideoThumbnail = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }));
          } else {
            reject(new Error("Failed to generate thumbnail"));
          }
          URL.revokeObjectURL(video.src);
        },
        "image/jpeg",
        0.8
      );
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
  });
};
