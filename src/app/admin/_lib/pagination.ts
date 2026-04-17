export const ADMIN_PAGE_SIZE = 10;

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export type AdminPagination = {
  page: number;
  pageSize: number;
  from: number;
  to: number;
};

export function getAdminPagination(
  searchParams: AdminSearchParams,
  pageSize = ADMIN_PAGE_SIZE,
): AdminPagination {
  const rawPage = searchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsedPage = Number(pageValue);
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return {
    page,
    pageSize,
    from,
    to,
  };
}

export function getVisibleItemRange(
  page: number,
  pageSize: number,
  totalCount: number,
) {
  if (totalCount === 0) {
    return {
      startItem: 0,
      endItem: 0,
    };
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return {
    startItem,
    endItem,
  };
}
