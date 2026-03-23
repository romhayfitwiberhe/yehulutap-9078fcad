const mockStories = [
  { id: "your", username: "Your story", avatar: "", isOwn: true, hasStory: false },
  { id: "1", username: "alex_dev", avatar: "", hasStory: true },
  { id: "2", username: "sara.m", avatar: "", hasStory: true },
  { id: "3", username: "mike_photo", avatar: "", hasStory: true },
  { id: "4", username: "luna.art", avatar: "", hasStory: true },
  { id: "5", username: "john_fit", avatar: "", hasStory: true },
  { id: "6", username: "emma_cook", avatar: "", hasStory: true },
  { id: "7", username: "david.k", avatar: "", hasStory: true },
];

const StoriesBar = () => {
  return (
    <div className="border-b border-border bg-background">
      <div className="flex gap-3 px-3 py-3 overflow-x-auto scrollbar-hide">
        {mockStories.map((story) => (
          <button key={story.id} className="flex flex-col items-center gap-1 min-w-[64px]">
            <div className={`relative w-[62px] h-[62px] rounded-full flex items-center justify-center ${story.hasStory ? "bg-gradient-to-tr from-primary via-pink-500 to-orange-400 p-[2.5px]" : "p-[2.5px]"}`}>
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-muted-foreground text-lg font-semibold overflow-hidden">
                {story.avatar ? (
                  <img src={story.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  story.username.charAt(0).toUpperCase()
                )}
              </div>
              {story.isOwn && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <span className="text-primary-foreground text-xs font-bold">+</span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-[64px] text-center">
              {story.isOwn ? "Your story" : story.username}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
