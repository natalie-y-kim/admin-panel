import Link from "next/link";
import { AdminSidebar } from "./_components/AdminSidebar";
import { ThemeToggle } from "./_components/ThemeToggle";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:var(--panel)]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85f2b] dark:text-[#f2a65a]">
              The Humor Project
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Admin Control Room
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/logout"
              prefetch={false}
              className="rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#d5b497] hover:bg-[#fff8ef] dark:text-slate-100 dark:hover:bg-[var(--panel-muted)]"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:py-8">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
