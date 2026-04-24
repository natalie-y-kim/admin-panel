import Link from "next/link";
import {
  type AdminSearchParams,
  getVisibleItemRange,
} from "../_lib/pagination";

type AdminPaginationProps = {
  basePath: string;
  searchParams: AdminSearchParams;
  page: number;
  pageSize: number;
  totalCount: number;
  itemLabel?: string;
};

function buildPageHref(
  basePath: string,
  searchParams: AdminSearchParams,
  page: number,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    params.set(key, value);
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function AdminPagination({
  basePath,
  searchParams,
  page,
  pageSize,
  totalCount,
  itemLabel = "records",
}: AdminPaginationProps) {
  if (totalCount === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const { startItem, endItem } = getVisibleItemRange(page, pageSize, totalCount);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const linkClassName =
    "inline-flex rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#d5b497] hover:bg-[#fff8ef] dark:text-slate-200 dark:hover:bg-[var(--panel-muted)]";
  const disabledClassName =
    "inline-flex cursor-not-allowed rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-slate-400";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
      <p className="font-medium">
        Showing {startItem}-{endItem} of {totalCount} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        {hasPreviousPage ? (
          <Link
            href={buildPageHref(basePath, searchParams, page - 1)}
            className={linkClassName}
          >
            Previous
          </Link>
        ) : (
          <span className={disabledClassName}>Previous</span>
        )}
        <span className="px-2 text-slate-600 dark:text-slate-300">
          Page {page} of {totalPages}
        </span>
        {hasNextPage ? (
          <Link
            href={buildPageHref(basePath, searchParams, page + 1)}
            className={linkClassName}
          >
            Next
          </Link>
        ) : (
          <span className={disabledClassName}>Next</span>
        )}
      </div>
    </div>
  );
}
