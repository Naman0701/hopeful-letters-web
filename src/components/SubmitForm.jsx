import { useState } from "react";
import { api } from "../api.js";
import { DEFAULT_AUTHOR, STORY_LIMITS } from "../constants.js";

const initialState = {
  author: "",
  age_at_attempt: "",
  title: "",
  message: "",
};

export default function SubmitForm({ onSubmitted }) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ state: "idle", error: null });

  function update(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ state: "submitting", error: null });
    try {
      const payload = {
        author: form.author.trim() || DEFAULT_AUTHOR,
        title: form.title.trim(),
        message: form.message.trim(),
        age_at_attempt: form.age_at_attempt ? Number(form.age_at_attempt) : null,
      };
      const created = await api.submitStory(payload);
      setStatus({ state: "success", error: null });
      setForm(initialState);
      onSubmitted?.(created);
    } catch (error) {
      setStatus({ state: "error", error: error.message });
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm " +
    "focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 " +
    "dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-100 dark:placeholder:text-stone-500 " +
    "dark:focus:border-amber-400 dark:focus:ring-amber-500/30";

  return (
    <section
      id="share"
      className="rounded-2xl border border-stone-200 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-stone-700/70 dark:bg-stone-900/60"
    >
      <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
        Share your letter
      </h2>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        If you survived and you're glad you did, your words could keep someone here tonight.
        Submissions are reviewed before being published. Please focus on{" "}
        <strong className="text-stone-800 dark:text-stone-200">recovery and hope</strong> — avoid
        graphic detail or method.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Name</span>
            <input
              type="text"
              value={form.author}
              onChange={update("author")}
              maxLength={STORY_LIMITS.AUTHOR_MAX}
              placeholder={DEFAULT_AUTHOR}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Age at the time <span className="text-stone-400 dark:text-stone-500">(optional)</span>
            </span>
            <input
              type="number"
              min={STORY_LIMITS.AGE_MIN}
              max={STORY_LIMITS.AGE_MAX}
              value={form.age_at_attempt}
              onChange={update("age_at_attempt")}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Title</span>
          <input
            type="text"
            required
            value={form.title}
            onChange={update("title")}
            maxLength={STORY_LIMITS.TITLE_MAX}
            placeholder="A short headline for your letter"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Your letter{" "}
            <span className="text-stone-400 dark:text-stone-500">
              ({STORY_LIMITS.MESSAGE_MIN} – {STORY_LIMITS.MESSAGE_MAX} characters)
            </span>
          </span>
          <textarea
            required
            value={form.message}
            onChange={update("message")}
            minLength={STORY_LIMITS.MESSAGE_MIN}
            maxLength={STORY_LIMITS.MESSAGE_MAX}
            rows={8}
            placeholder="What would you say to the person you were that day?"
            className={
              "mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-serif " +
              "text-base leading-relaxed shadow-sm focus:border-amber-500 focus:outline-none " +
              "focus:ring-2 focus:ring-amber-300 dark:border-stone-600 dark:bg-stone-900/70 " +
              "dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-amber-400 " +
              "dark:focus:ring-amber-500/30"
            }
          />
          <span className="mt-1 block text-right text-xs text-stone-500 dark:text-stone-400">
            {form.message.length} / {STORY_LIMITS.MESSAGE_MAX}
          </span>
        </label>

        {status.state === "error" && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
            {status.error}
          </div>
        )}
        {status.state === "success" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
            Thank you. Your letter was received and will appear after a quick review.
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={status.state === "submitting"}
            className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-stone-900 dark:hover:bg-amber-400"
          >
            {status.state === "submitting" ? "Sending…" : "Send my letter"}
          </button>
        </div>
      </form>
    </section>
  );
}
