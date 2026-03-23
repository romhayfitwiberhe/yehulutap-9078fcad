import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { StoryGroup, StoryWithProfile } from "@/hooks/useStories";

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const STORY_DURATION = 5000;

const StoryViewer = ({ groups, initialGroupIndex, isOpen, onClose }: StoryViewerProps) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const resetTimer = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    startTimeRef.current = Date.now();
    setProgress(0);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        timerRef.current = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    };
    timerRef.current = requestAnimationFrame(tick);
  }, []);

  const goNext = useCallback(() => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [group, storyIndex, groupIndex, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      setStoryIndex(0);
    }
  }, [storyIndex, groupIndex]);

  useEffect(() => {
    if (isOpen && story) resetTimer();
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [isOpen, storyIndex, groupIndex, story]);

  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(0);
  }, [initialGroupIndex]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  };

  if (!group || !story) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black flex items-center justify-center"
        >
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
            {group.stories.map((_, i) => (
              <div key={i} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-card/50 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                {group.avatar_url ? (
                  <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  group.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="text-white text-sm font-semibold">{group.username}</span>
                <span className="text-white/60 text-xs ml-2">
                  {new Date(story.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Story content */}
          <div className="absolute inset-0" onClick={handleTap}>
            {story.media_url ? (
              story.type === "video" ? (
                <video
                  src={story.media_url}
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <img src={story.media_url} alt="" className="w-full h-full object-contain" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent p-8">
                <p className="text-white text-2xl font-bold text-center">
                  {story.content || story.caption || ""}
                </p>
              </div>
            )}
          </div>

          {/* Caption */}
          {story.caption && story.media_url && (
            <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
              <p className="text-white text-sm bg-black/40 rounded-lg px-3 py-2">
                {story.caption}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoryViewer;
