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
      className="rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-800 transition hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-100 dark:hover:bg-purple-500/20 dark:focus:ring-offset-slate-950"
      suppressHydrationWarning
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
