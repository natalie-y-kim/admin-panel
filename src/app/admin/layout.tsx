import Link from "next/link";
import { AdminSidebar } from "./_components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="text-sm font-semibold text-slate-800">Humor Admin</p>
          <Link
            href="/logout"
            prefetch={false}
            className="rounded-md px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </Link>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
