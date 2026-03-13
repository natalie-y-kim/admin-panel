import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createWhitelistEmailAddressAction } from "../actions";

type NewWhitelistEmailAddressesPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewWhitelistEmailAddressesPage({
  searchParams,
}: NewWhitelistEmailAddressesPageProps) {
  await requireSuperadmin();
  const params = await searchParams;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New Whitelist Address</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new approved email address.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createWhitelistEmailAddressAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="email_address"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <input
            id="email_address"
            name="email_address"
            type="email"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Create Address
          </button>
          <Link
            href="/admin/whitelist-email-addresses"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
