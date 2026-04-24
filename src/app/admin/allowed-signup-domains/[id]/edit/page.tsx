import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateAllowedSignupDomainAction } from "../../actions";

type EditAllowedSignupDomainsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditAllowedSignupDomainsPage({
  params,
  searchParams,
}: EditAllowedSignupDomainsPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: domain, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Signup Domain</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this signup domain right now.
        </p>
        <Link
          href="/admin/allowed-signup-domains"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Signup Domains
        </Link>
      </section>
    );
  }

  if (!domain) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Signup Domain</h1>
      <p className="mt-2 text-sm text-slate-600">Update the domain and save.</p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateAllowedSignupDomainAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={domain.id} />

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
            defaultValue={domain.apex_domain}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="admin-primary-button"
          >
            Save Changes
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
