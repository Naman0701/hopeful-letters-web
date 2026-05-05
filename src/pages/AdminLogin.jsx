import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { adminApi } from "../admin/api.js";
import { isAdminAuthed } from "../admin/auth.js";
import { ROUTES } from "../constants.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", error: null });

  useEffect(() => {
    document.title = "Admin · Hopeful Letters";
  }, []);

  if (isAdminAuthed()) {
    const target = location.state?.from?.pathname || ROUTES.ADMIN_DASHBOARD;
    return <Navigate to={target} replace />;
  }

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ state: "submitting", error: null });
    try {
      await adminApi.login(form.username, form.password);
      const target = location.state?.from?.pathname || ROUTES.ADMIN_DASHBOARD;
      navigate(target, { replace: true });
    } catch (error) {
      setStatus({ state: "error", error: error.message });
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex justify-end px-4 pt-4">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
              Hopeful Letters
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold text-stone-900 dark:text-stone-50">
              Admin sign in
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Moderate submissions, search and remove letters.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-stone-200 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-stone-700/70 dark:bg-stone-900/60"
          >
            <label className="block">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Username
              </span>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={form.username}
                onChange={update("username")}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-100 dark:focus:border-amber-400 dark:focus:ring-amber-500/30"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={update("password")}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-100 dark:focus:border-amber-400 dark:focus:ring-amber-500/30"
              />
            </label>

            {status.state === "error" && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
                {status.error}
              </div>
            )}

            <button
              type="submit"
              disabled={status.state === "submitting"}
              className="mt-6 w-full rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-500 dark:text-stone-900 dark:hover:bg-amber-400"
            >
              {status.state === "submitting" ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500 dark:text-stone-500">
            Not a moderator?{" "}
            <a
              href={ROUTES.HOME}
              className="underline hover:text-stone-800 dark:hover:text-stone-300"
            >
              Back to the letters
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
