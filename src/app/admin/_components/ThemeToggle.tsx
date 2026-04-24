"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("admin-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#d5b497] hover:bg-[#fff8ef] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:text-slate-100 dark:hover:bg-[var(--panel-muted)] dark:focus:ring-offset-slate-950"
      suppressHydrationWarning
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
