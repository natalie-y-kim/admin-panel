import type { AdminSearchParams } from "./pagination";

export function getStringParam(
  searchParams: AdminSearchParams,
  key: string,
) {
  const value = searchParams[key];
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue?.trim() ?? "";
}

export function getBooleanParam(
  searchParams: AdminSearchParams,
  key: string,
) {
  const value = getStringParam(searchParams, key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

export function getIntegerParam(
  searchParams: AdminSearchParams,
  key: string,
) {
  const value = getStringParam(searchParams, key);
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export function getLikePattern(value: string) {
  return `%${value.replaceAll(",", " ")}%`;
}

export function hasAdminFilters(
  searchParams: AdminSearchParams,
  keys: string[],
) {
  return keys.some((key) => getStringParam(searchParams, key) !== "");
}
