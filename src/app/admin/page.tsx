import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";

export default async function AdminDashboardPage() {
  const { user } = await requireSuperadmin();

  return (
    <section className="w-full rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-3 text-sm text-slate-600">
        Signed in as <span className="font-medium">{user.email}</span>.
      </p>
      <Link
        href="/logout"
        className="mt-6 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
      >
        Log out
      </Link>
    </section>
  );
}
