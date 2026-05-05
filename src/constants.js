/**
 * Project-wide constants.
 *
 * Anything used in more than one place — or anything a maintainer might want
 * to change without grepping the whole codebase — lives here.
 *
 * The STORY_LIMITS values MUST stay in sync with `backend/app/constants.py`.
 * If you change one, change the other.
 *
 * NOTE: There is one literal string that intentionally stays out of sync with
 * STORAGE_KEYS.THEME — the inline pre-paint script in `index.html` reads
 * `localStorage.getItem("theme")` directly because it runs before any module
 * is imported. Keep that string in lockstep with STORAGE_KEYS.THEME.
 */

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const ROUTES = Object.freeze({
  HOME: "/",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
});

// ---------------------------------------------------------------------------
// API paths
// ---------------------------------------------------------------------------
export const API = Object.freeze({
  STORIES: "/api/stories",
  STORIES_RANDOM: "/api/stories/random",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_STORIES: "/api/admin/stories",
});

// ---------------------------------------------------------------------------
// Storage keys (sessionStorage / localStorage)
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = Object.freeze({
  THEME: "theme",
  ADMIN_CREDENTIALS: "admin-credentials",
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export const PUBLIC_PAGE_SIZE = 4;
export const ADMIN_PAGE_SIZE = 10;

// How many adjacent page numbers (each side of current) to show in the
// numbered pagination control before collapsing into "…".
export const PAGINATION_SIBLINGS = 1;

// ---------------------------------------------------------------------------
// Story display
// ---------------------------------------------------------------------------
// Roughly how many characters of the message to show on a card before "…".
export const PREVIEW_CHARS = 220;

// ---------------------------------------------------------------------------
// Story field limits — must mirror backend/app/constants.py
// ---------------------------------------------------------------------------
export const STORY_LIMITS = Object.freeze({
  AUTHOR_MAX: 80,
  TITLE_MAX: 140,
  MESSAGE_MIN: 40,
  MESSAGE_MAX: 6000,
  AGE_MIN: 8,
  AGE_MAX: 120,
});

export const DEFAULT_AUTHOR = "Anonymous";

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------
export const ADMIN_STATUS_OPTIONS = Object.freeze([
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
]);
