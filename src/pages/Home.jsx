import { useCallback, useEffect, useState } from "react";
import HelpBanner from "../components/HelpBanner.jsx";
import Pagination from "../components/Pagination.jsx";
import StoryList from "../components/StoryList.jsx";
import StoryModal from "../components/StoryModal.jsx";
import SubmitForm from "../components/SubmitForm.jsx";
import { api } from "../api.js";
import { PUBLIC_PAGE_SIZE } from "../constants.js";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStory, setActiveStory] = useState(null);

  const loadStories = useCallback(async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      const { items, total: totalCount } = await api.listStories({
        limit: PUBLIC_PAGE_SIZE,
        skip: targetPage * PUBLIC_PAGE_SIZE,
      });
      setStories(items);
      setTotal(totalCount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories(page);
  }, [loadStories, page]);

  const pageCount = Math.max(1, Math.ceil(total / PUBLIC_PAGE_SIZE));

  const handleSubmitted = useCallback(() => {
    setPage(0);
    loadStories(0);
  }, [loadStories]);

  const handleChangePage = useCallback((nextPage) => {
    setPage(nextPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-full">
      <HelpBanner />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:pt-16">
        <header className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
            Hopeful Letters
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-stone-900 sm:text-5xl dark:text-stone-50">
            They lived. They're glad they did.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-stone-600 sm:text-lg dark:text-stone-300">
            Letters from people who once thought it was the end — and who want you to know that the
            chapter you're in right now is not the whole story. Stay one more day. Read one more
            letter.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#share"
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800 dark:bg-amber-500 dark:text-stone-900 dark:hover:bg-amber-400"
            >
              Share your letter
            </a>
            <button
              type="button"
              onClick={() => loadStories(page)}
              className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
            >
              Refresh letters
            </button>
          </div>
        </header>

        <section className="mb-16">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">
              Letters
            </h2>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {loading
                ? "Loading…"
                : `${total} letter${total === 1 ? "" : "s"} · page ${page + 1} of ${pageCount}`}
            </span>
          </div>
          <StoryList
            stories={stories}
            loading={loading}
            error={error}
            onRetry={() => loadStories(page)}
            onOpen={setActiveStory}
          />
          <Pagination page={page} pageCount={pageCount} onChange={handleChangePage} />
        </section>

        <SubmitForm onSubmitted={handleSubmitted} />

        <footer className="mt-16 border-t border-stone-200 pt-6 text-center text-xs text-stone-500 dark:border-stone-800 dark:text-stone-500">
          <p>
            This site is not a substitute for professional help. If you're in immediate danger,
            please contact your local emergency services or one of the helplines above.
          </p>
          <p className="mt-2">
            Made with care. Submissions are moderated for safe-messaging guidelines.
          </p>
        </footer>
      </main>

      <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
    </div>
  );
}
