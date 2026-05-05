import { useEffect, useRef } from "react";

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function StoryModal({ story, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!story) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-t-2xl border border-stone-200 bg-white shadow-xl sm:rounded-2xl dark:border-stone-700 dark:bg-stone-900"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close letter"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/80 text-stone-700 shadow-sm transition hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[90vh] overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-2 inline-flex rounded-full bg-gradient-to-r from-amber-200 to-rose-200 px-3 py-0.5 text-xs font-medium text-stone-700 shadow-sm dark:from-amber-500/40 dark:to-rose-500/40 dark:text-stone-100">
            a letter of hope
          </div>
          <h2
            id="story-modal-title"
            className="font-serif text-3xl font-semibold leading-tight break-words text-stone-900 sm:text-4xl dark:text-stone-50"
          >
            {story.title}
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            — {story.author}
            {story.age_at_attempt ? `, ${story.age_at_attempt} at the time` : ""}
            {story.created_at ? ` · ${formatDate(story.created_at)}` : ""}
          </p>

          <div className="mt-6 rounded-xl border border-stone-200/80 bg-stone-50/60 p-5 dark:border-stone-700/60 dark:bg-stone-800/40">
            <p className="letter-body text-stone-800 dark:text-stone-200">{story.message}</p>
          </div>

          <p className="mt-6 text-xs text-stone-500 dark:text-stone-400">
            If reading this is bringing up difficult feelings, please consider reaching out to one
            of the helplines at the top of the page. You don't have to do this alone.
          </p>
        </div>
      </div>
    </div>
  );
}
