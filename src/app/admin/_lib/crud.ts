export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export function normalizeBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export function getTextValue(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export function getNullableTextValue(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  return value || null;
}

export function getOptionalIntegerValue(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function getRequiredIntegerValue(formData: FormData, key: string) {
  const value = getTextValue(formData, key);
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
