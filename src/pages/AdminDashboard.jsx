import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination.jsx";
import StoryModal from "../components/StoryModal.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { adminApi, AdminAuthError } from "../admin/api.js";
import { clearAdminAuth } from "../admin/auth.js";
import { ADMIN_PAGE_SIZE, ADMIN_STATUS_OPTIONS, MODERATION_STATUS, ROUTES } from "../constants.js";

// Bulk "reject" only skips rows that a human already manually rejected — those
// are truly idempotent. Auto-rejected rows are intentionally INCLUDED, because
// flipping them from `auto_rejected` → `human_rejected` is a meaningful audit
// event ("the human reviewed and agreed with the LLM"), not a no-op.

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Style + label per moderation_status. Falls back to legacy approved/pending
// for documents that pre-date the moderation pipeline.
const BADGE_BY_STATUS = {
  [MODERATION_STATUS.AUTO_APPROVED]: {
    label: "Auto-approved",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  [MODERATION_STATUS.HUMAN_APPROVED]: {
    label: "Approved",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  [MODERATION_STATUS.NEEDS_REVIEW]: {
    label: "Needs review",
    cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  },
  [MODERATION_STATUS.AUTO_REJECTED]: {
    label: "Auto-rejected",
    cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
  [MODERATION_STATUS.HUMAN_REJECTED]: {
    label: "Rejected",
    cls: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
  [MODERATION_STATUS.PENDING]: {
    label: "Pending",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
};

function StatusBadge({ story }) {
  const explicit = story.moderation_status && BADGE_BY_STATUS[story.moderation_status];
  const fallback = story.approved
    ? BADGE_BY_STATUS[MODERATION_STATUS.HUMAN_APPROVED]
    : BADGE_BY_STATUS[MODERATION_STATUS.PENDING];
  const { label, cls } = explicit ?? fallback;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    document.title = "Admin · Hopeful Letters";
  }, []);

  const handleAuthError = useCallback(() => {
    clearAdminAuth();
    navigate(ROUTES.ADMIN_LOGIN, { replace: true });
  }, [navigate]);

  const load = useCallback(
    async (targetPage, q, status) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminApi.listStories({
          q,
          status,
          limit: ADMIN_PAGE_SIZE,
          skip: targetPage * ADMIN_PAGE_SIZE,
        });
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        if (err instanceof AdminAuthError) {
          handleAuthError();
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  useEffect(() => {
    load(page, appliedSearch, statusFilter);
  }, [load, page, appliedSearch, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(0);
    setAppliedSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(0);
  }

  function handleStatusChange(nextStatus) {
    if (nextStatus === statusFilter) return;
    setPage(0);
    setStatusFilter(nextStatus);
  }

  function handleLogout() {
    clearAdminAuth();
    navigate(ROUTES.ADMIN_LOGIN, { replace: true });
  }

  // Apply one of {approve, reject, delete} to every visible story on this
  // page. Pre-filters to skip rows already in the target state so the count
  // shown in the confirm dialog is meaningful. Uses Promise.allSettled so a
  // single failure doesn't abort the rest.
  async function runBulkAction(action) {
    const targets = items.filter((s) => {
      if (action === "approve") return s.moderation_status !== MODERATION_STATUS.HUMAN_APPROVED;
      if (action === "reject") return s.moderation_status !== MODERATION_STATUS.HUMAN_REJECTED;
      return true; // delete applies to everything
    });

    if (targets.length === 0) {
      window.alert(
        action === "approve"
          ? "Nothing to approve on this page — every visible story is already approved."
          : action === "reject"
            ? "Nothing to reject on this page — every visible story is already rejected."
            : "No stories on this page.",
      );
      return;
    }

    const verb = action === "delete" ? "permanently delete" : action;
    const tail = action === "delete" ? " This cannot be undone." : "";
    if (
      !window.confirm(
        `${verb[0].toUpperCase() + verb.slice(1)} ${targets.length} story(ies) on this page?${tail}`,
      )
    ) {
      return;
    }

    setBulkBusy(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        targets.map((story) => {
          if (action === "approve") return adminApi.setApproved(story._id, true);
          if (action === "reject") return adminApi.setApproved(story._id, false);
          return adminApi.deleteStory(story._id);
        }),
      );

      const authError = results.find(
        (r) => r.status === "rejected" && r.reason instanceof AdminAuthError,
      );
      if (authError) {
        handleAuthError();
        return;
      }

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        setError(
          `${failed.length} of ${targets.length} bulk operations failed. ` +
            `First error: ${failed[0].reason?.message ?? "unknown"}`,
        );
      }

      await load(page, appliedSearch, statusFilter);
    } finally {
      setBulkBusy(false);
    }
  }

  async function runAction(story, action) {
    setBusyId(story._id);
    try {
      if (action === "approve") {
        await adminApi.setApproved(story._id, true);
      } else if (action === "unapprove") {
        await adminApi.setApproved(story._id, false);
      } else if (action === "delete" || action === "reject") {
        const message =
          action === "reject"
            ? `Reject and permanently delete "${story.title}"?`
            : `Delete "${story.title}" permanently? This cannot be undone.`;
        if (!window.confirm(message)) {
          setBusyId(null);
          return;
        }
        await adminApi.deleteStory(story._id);
      }
      await load(page, appliedSearch, statusFilter);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        handleAuthError();
        return;
      }
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-stone-200 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex flex-1 items-baseline gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
              Hopeful Letters
            </p>
            <h1 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
              Admin
            </h1>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, author, or message"
              className="w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-amber-400 dark:focus:ring-amber-500/30"
            />
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800 dark:bg-amber-500 dark:text-stone-900 dark:hover:bg-amber-400"
            >
              Search
            </button>
            {appliedSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                Clear
              </button>
            )}
          </form>

          <div
            className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm dark:border-stone-700 dark:bg-stone-800"
            role="tablist"
            aria-label="Status filter"
          >
            {ADMIN_STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleStatusChange(option.id)}
                  className={
                    "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                    (active
                      ? "bg-stone-900 text-white shadow dark:bg-amber-500 dark:text-stone-900"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700")
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white/85 shadow-sm backdrop-blur dark:border-stone-700/70 dark:bg-stone-900/60">
          <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between dark:border-stone-700/70 dark:text-stone-400">
            <span>
              {loading
                ? "Loading…"
                : `${total} result${total === 1 ? "" : "s"} · page ${page + 1} of ${pageCount}`}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {appliedSearch && (
                <span className="truncate pr-2">
                  Filter:{" "}
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    “{appliedSearch}”
                  </span>
                </span>
              )}
              <button
                type="button"
                disabled={bulkBusy || loading || items.length === 0}
                onClick={() => runBulkAction("approve")}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                title="Approve every story on this page that isn't already approved"
              >
                Approve all on page
              </button>
              <button
                type="button"
                disabled={bulkBusy || loading || items.length === 0}
                onClick={() => runBulkAction("reject")}
                className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/60 dark:bg-stone-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                title="Mark every story on this page as rejected (preserves the row for audit)"
              >
                Reject all on page
              </button>
              <button
                type="button"
                disabled={bulkBusy || loading || items.length === 0}
                onClick={() => runBulkAction("delete")}
                className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 shadow-sm hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/60"
                title="Permanently delete every story on this page"
              >
                Delete all on page
              </button>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
              {error}
            </div>
          )}

          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {!loading && items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                No stories match those filters.
              </li>
            )}
            {items.map((story) => {
              const busy = busyId === story._id;
              return (
                <li
                  key={story._id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStory(story)}
                        className="text-left font-serif text-base font-semibold break-words text-stone-900 underline-offset-2 hover:underline dark:text-stone-100"
                      >
                        {story.title}
                      </button>
                      <StatusBadge story={story} />
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      — {story.author}
                      {story.age_at_attempt ? `, ${story.age_at_attempt} at the time` : ""}
                      {story.created_at ? ` · ${formatDate(story.created_at)}` : ""}
                    </p>
                    {story.moderation_reason && (
                      <p className="mt-1 text-xs italic text-stone-500 dark:text-stone-400">
                        Moderator: {story.moderation_reason}
                      </p>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
                      {story.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {!story.approved ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => runAction(story, "approve")}
                          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => runAction(story, "reject")}
                          className="rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/60 dark:bg-stone-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(story, "unapprove")}
                        className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-100 disabled:opacity-60 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(story, "delete")}
                      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 shadow-sm hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/60"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-stone-200 px-4 py-4 dark:border-stone-700/70">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </div>
        </section>
      </main>

      <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
    </div>
  );
}
