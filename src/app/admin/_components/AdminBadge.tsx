type AdminBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent";

const toneClassNames: Record<AdminBadgeTone, string> = {
  neutral:
    "border-[var(--border)] bg-[color:var(--panel-strong)] text-slate-700 dark:text-slate-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  danger:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
  accent:
    "border-[#ead4bf] bg-[#fff4e9] text-[#9b531f] dark:border-[#f2a65a]/30 dark:bg-[#f2a65a]/10 dark:text-[#f6c28b]",
};

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: AdminBadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${toneClassNames[tone]}`}
    >
      {children}
    </span>
  );
}
