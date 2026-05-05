import { useState } from "react";
import { helplines } from "../data/helplines.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function HelpBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 w-full border-b border-amber-200 bg-amber-50/95 backdrop-blur dark:border-amber-900/40 dark:bg-stone-900/85">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 text-sm text-amber-900 dark:text-amber-100">
        <span aria-hidden className="text-base">
          💛
        </span>
        <p className="flex-1">
          If you are in crisis right now, please reach out. You don't have to do this alone.
        </p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-900 shadow-sm hover:bg-amber-100 dark:border-stone-600 dark:bg-stone-800 dark:text-amber-200 dark:hover:bg-stone-700"
          aria-expanded={open}
        >
          {open ? "Hide helplines" : "Get help now"}
        </button>
        <ThemeToggle />
      </div>
      {open && (
        <div className="border-t border-amber-200 bg-white dark:border-amber-900/30 dark:bg-stone-900/80">
          <ul className="mx-auto grid max-w-5xl gap-3 px-4 py-4 sm:grid-cols-2">
            {helplines.map((line) => (
              <li
                key={`${line.region}-${line.name}`}
                className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-900/30 dark:bg-stone-800/70"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  {line.region}
                </div>
                <div className="mt-1 font-medium text-stone-800 dark:text-stone-100">
                  {line.name}
                </div>
                <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400">{line.detail}</p>
                <a
                  href={line.href}
                  className="mt-1 inline-block text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200"
                  target={line.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {line.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
