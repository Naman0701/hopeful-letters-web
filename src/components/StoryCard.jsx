import { PREVIEW_CHARS } from "../constants.js";

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

function makePreview(text) {
  if (!text) return { preview: "", truncated: false };
  if (text.length <= PREVIEW_CHARS) return { preview: text, truncated: false };
  const slice = text.slice(0, PREVIEW_CHARS);
  const lastSpace = slice.lastIndexOf(" ");
  const cutoff = lastSpace > PREVIEW_CHARS - 40 ? lastSpace : PREVIEW_CHARS;
  return { preview: slice.slice(0, cutoff).trimEnd() + "…", truncated: true };
}

export default function StoryCard({ story, onOpen }) {
  const { preview, truncated } = makePreview(story.message);
  const handleClick = () => onOpen?.(story);
  const handleKey = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.(story);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label={`Read full letter: ${story.title}`}
      className="group relative cursor-pointer rounded-2xl border border-stone-200/80 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-stone-700/70 dark:bg-stone-900/60 dark:shadow-stone-950/40 dark:hover:shadow-stone-950/60"
    >
      <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-amber-200 to-rose-200 px-3 py-0.5 text-xs font-medium text-stone-700 shadow-sm dark:from-amber-500/40 dark:to-rose-500/40 dark:text-stone-100">
        a letter of hope
      </div>
      <header className="mb-3">
        <h3 className="font-serif text-xl font-semibold break-words text-stone-900 dark:text-stone-100">
          {story.title}
        </h3>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          — {story.author}
          {story.age_at_attempt ? `, ${story.age_at_attempt} at the time` : ""}
          {story.created_at ? ` · ${formatDate(story.created_at)}` : ""}
        </p>
      </header>
      <p className="letter-body text-stone-700 dark:text-stone-300">{preview}</p>
      <div className="mt-4 flex items-center justify-end">
        <span className="text-sm font-medium text-amber-700 group-hover:underline dark:text-amber-300">
          {truncated ? "Read full letter →" : "Open letter →"}
        </span>
      </div>
    </article>
  );
}
