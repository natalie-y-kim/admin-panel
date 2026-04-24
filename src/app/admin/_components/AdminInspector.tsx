export function AdminInspector({
  summary,
  children,
  className = "",
}: {
  summary: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={`group ${className}`.trim()}>
      <summary className="inline-flex cursor-pointer list-none rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
        {summary}
      </summary>
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
        {children}
      </div>
    </details>
  );
}
