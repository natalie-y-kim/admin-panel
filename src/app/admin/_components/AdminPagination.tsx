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
    "inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50";
  const disabledClassName =
    "inline-flex cursor-not-allowed rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <p>
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
        <span className="px-2 text-slate-600">
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
