import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateWhitelistEmailAddressAction } from "../../actions";

type EditWhitelistEmailAddressesPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditWhitelistEmailAddressesPage({
  params,
  searchParams,
}: EditWhitelistEmailAddressesPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: address, error } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Whitelist Address</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this whitelist address right now.
        </p>
        <Link
          href="/admin/whitelist-email-addresses"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Whitelist Addresses
        </Link>
      </section>
    );
  }

  if (!address) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Whitelist Address</h1>
      <p className="mt-2 text-sm text-slate-600">Update the email address and save.</p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateWhitelistEmailAddressAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={address.id} />

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
            defaultValue={address.email_address}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Save Changes
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
