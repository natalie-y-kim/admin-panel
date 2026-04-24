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
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
      {options.map((option) => {
        const isActive = option.key === currentView;

        return (
          <Link
            key={option.key}
            href={buildHref(basePath, searchParams, option.key)}
            className={
              isActive
                ? "rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                : "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            }
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
