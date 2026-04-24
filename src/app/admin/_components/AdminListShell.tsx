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
    <section className="w-full rounded-2xl border border-purple-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          ) : null}
        </div>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>
      {children}
    </section>
  );
}
