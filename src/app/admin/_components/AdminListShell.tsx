export function AdminListShell({
  title,
  description,
  toolbar,
  children,
}: {
  title: string;
  description?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-[color:var(--panel)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85f2b] dark:text-[#f2a65a]">
            Admin workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
