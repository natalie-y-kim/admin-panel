import Link from "next/link";
import { AdminSidebar } from "./_components/AdminSidebar";
import { ThemeToggle } from "./_components/ThemeToggle";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-purple-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="text-sm font-semibold text-purple-800 dark:text-purple-100">
            Humor Admin
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/logout"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
