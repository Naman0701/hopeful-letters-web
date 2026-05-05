import { useEffect, useState } from "react";
import { PAGINATION_SIBLINGS as SIBLINGS } from "../constants.js";

function buildItems(page, pageCount) {
  const slotCount = SIBLINGS * 2 + 5;
  if (pageCount <= slotCount) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const left = Math.max(page - SIBLINGS, 1);
  const right = Math.min(page + SIBLINGS, pageCount - 2);
  const showLeftDots = left > 2;
  const showRightDots = right < pageCount - 3;

  const items = [0];
  if (showLeftDots) {
    items.push("dots-left");
  } else {
    for (let index = 1; index < left; index += 1) items.push(index);
  }
  for (let index = left; index <= right; index += 1) items.push(index);
  if (showRightDots) {
    items.push("dots-right");
  } else {
    for (let index = right + 1; index < pageCount - 1; index += 1) items.push(index);
  }
  items.push(pageCount - 1);
  return items;
}

const navButtonClass =
  "inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 " +
  "text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-100 " +
  "disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 " +
  "dark:text-stone-100 dark:hover:bg-stone-700";

const numberButtonBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm " +
  "font-medium shadow-sm transition focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-amber-400";

const numberInactive =
  "border-stone-300 bg-white text-stone-800 hover:bg-stone-100 " +
  "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700";

const numberActive =
  "border-stone-900 bg-stone-900 text-white shadow-md " +
  "dark:border-amber-400 dark:bg-amber-500 dark:text-stone-900";

export default function Pagination({ page, pageCount, onChange }) {
  const [jumpValue, setJumpValue] = useState(String(page + 1));

  useEffect(() => {
    setJumpValue(String(page + 1));
  }, [page]);

  if (pageCount <= 1) return null;

  const goPrev = () => onChange(Math.max(0, page - 1));
  const goNext = () => onChange(Math.min(pageCount - 1, page + 1));
  const goTo = (index) => onChange(Math.min(pageCount - 1, Math.max(0, index)));

  const items = buildItems(page, pageCount);

  const handleJumpSubmit = (event) => {
    event.preventDefault();
    const parsed = Number.parseInt(jumpValue, 10);
    if (!Number.isFinite(parsed)) return;
    goTo(parsed - 1);
  };

  return (
    <nav className="mt-8 space-y-3" aria-label="Letters pagination">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={page === 0}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <span aria-hidden>←</span> Prev
        </button>

        {items.map((item, index) => {
          if (item === "dots-left" || item === "dots-right") {
            return (
              <span
                key={`${item}-${index}`}
                aria-hidden
                className="px-1 text-stone-500 dark:text-stone-400"
              >
                …
              </span>
            );
          }
          const isActive = item === page;
          return (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to page ${item + 1}`}
              className={`${numberButtonBase} ${isActive ? numberActive : numberInactive}`}
            >
              {item + 1}
            </button>
          );
        })}

        <button
          type="button"
          onClick={goNext}
          disabled={page >= pageCount - 1}
          className={navButtonClass}
          aria-label="Next page"
        >
          Next <span aria-hidden>→</span>
        </button>
      </div>

      {pageCount > 7 && (
        <form
          onSubmit={handleJumpSubmit}
          className="flex flex-wrap items-center justify-center gap-2 text-sm text-stone-600 dark:text-stone-400"
        >
          <label htmlFor="page-jump" className="font-medium">
            Jump to page
          </label>
          <input
            id="page-jump"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max={pageCount}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value.replace(/\D+/g, ""))}
            className="no-spinner w-20 rounded-md border border-stone-300 bg-white px-2 py-1 text-center text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-amber-400 dark:focus:ring-amber-500/30"
          />
          <span>of {pageCount}</span>
          <button type="submit" className={navButtonClass}>
            Go
          </button>
        </form>
      )}
    </nav>
  );
}
