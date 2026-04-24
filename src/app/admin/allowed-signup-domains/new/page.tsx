import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createAllowedSignupDomainAction } from "../actions";

type NewAllowedSignupDomainsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewAllowedSignupDomainsPage({
  searchParams,
}: NewAllowedSignupDomainsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New Signup Domain</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new allowed signup domain.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createAllowedSignupDomainAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="apex_domain"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Apex Domain
          </label>
          <input
            id="apex_domain"
            name="apex_domain"
            type="text"
            required
            placeholder="example.edu"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="admin-primary-button"
          >
            Create Domain
          </button>
          <Link
            href="/admin/allowed-signup-domains"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
