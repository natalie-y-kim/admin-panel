import Link from "next/link";
import type { AdminSearchParams } from "../_lib/pagination";

type ViewOption = {
  key: string;
  label: string;
};

function buildHref(
  basePath: string,
  searchParams: AdminSearchParams,
  nextView: string,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || key === "page" || key === "view") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    params.set(key, value);
  });

  if (nextView !== "preview") {
    params.set("view", nextView);
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function AdminViewToggle({
  basePath,
  searchParams,
  currentView,
  options,
}: {
  basePath: string;
  searchParams: AdminSearchParams;
  currentView: string;
  options: ViewOption[];
}) {
  return (
    <div className="inline-flex rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] p-1.5 dark:bg-[var(--panel-muted)]">
      {options.map((option) => {
        const isActive = option.key === currentView;

        return (
          <Link
            key={option.key}
            href={buildHref(basePath, searchParams, option.key)}
            className={
              isActive
                ? "rounded-full bg-[#172033] px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-[#f2a65a] dark:text-[#172033]"
                : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            }
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
