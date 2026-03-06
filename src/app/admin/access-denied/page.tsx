import Link from "next/link";

export default function AdminAccessDeniedPage() {
  return (
    <section className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        You are signed in successfully, but your account does not have
        superadmin access for the Humor Admin Panel.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          Go to login
        </Link>
        <Link
          href="/logout"
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Logout
        </Link>
      </div>
    </section>
  );
}
