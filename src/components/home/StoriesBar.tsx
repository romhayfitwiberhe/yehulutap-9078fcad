import { useStories, StoryGroup } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";
import StoryViewer from "@/components/StoryViewer";
import { useState } from "react";

const StoriesBar = () => {
  const { user } = useAuth();
  const { data: storyGroups = [] } = useStories();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openStory = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="border-b border-border bg-background">
        <div className="flex gap-3 px-3 py-3 overflow-x-auto scrollbar-hide">
          {/* Own story placeholder */}
          <button className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className="relative w-[62px] h-[62px] rounded-full p-[2.5px]">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-muted-foreground text-lg font-semibold">
                {user?.email?.charAt(0).toUpperCase() ?? "Y"}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <span className="text-primary-foreground text-xs font-bold">+</span>
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-[64px] text-center">Your story</span>
          </button>

          {storyGroups.filter(g => g.user_id !== user?.id).map((group, i) => (
            <button
              key={group.user_id}
              onClick={() => openStory(i)}
              className="flex flex-col items-center gap-1 min-w-[64px]"
            >
              <div className="relative w-[62px] h-[62px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-orange-400 p-[2.5px]">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-muted-foreground text-lg font-semibold overflow-hidden">
                  {group.avatar_url ? (
                    <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    group.username.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground truncate w-[64px] text-center">
                {group.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {storyGroups.length > 0 && (
        <StoryViewer
          groups={storyGroups.filter(g => g.user_id !== user?.id)}
          initialGroupIndex={viewerIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoriesBar;
