import StoryCard from "./StoryCard.jsx";

export default function StoryList({ stories, loading, error, onRetry, onOpen }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl border border-stone-200/70 bg-white/60 dark:border-stone-700/60 dark:bg-stone-900/50"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
        <p className="font-medium">We couldn't load the letters right now.</p>
        <p className="mt-1 text-sm text-rose-800/80 dark:text-rose-200/80">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white/70 p-8 text-center text-stone-600 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-400">
        No letters yet. If you have a story of survival, please consider sharing it below.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {stories.map((story) => (
        <StoryCard key={story.id || story._id} story={story} onOpen={onOpen} />
      ))}
    </div>
  );
}
