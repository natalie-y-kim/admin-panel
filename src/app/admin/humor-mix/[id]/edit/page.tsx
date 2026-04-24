import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateHumorMixAction } from "../../actions";

type EditHumorMixPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditHumorMixPage({
  params,
  searchParams,
}: EditHumorMixPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: humorMixRow, error }, { data: humorFlavors }] = await Promise.all([
    supabase
      .from("humor_flavor_mix")
      .select("id, humor_flavor_id, caption_count")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("humor_flavors")
      .select("id, slug")
      .order("slug", { ascending: true }),
  ]);

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Humor Mix</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this humor mix row right now.
        </p>
        <Link
          href="/admin/humor-mix"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Humor Mix
        </Link>
      </section>
    );
  }

  if (!humorMixRow) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Humor Mix</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update the flavor assignment and caption count.
      </p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateHumorMixAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={humorMixRow.id} />

        <div>
          <label
            htmlFor="humor_flavor_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Humor Flavor
          </label>
          <select
            id="humor_flavor_id"
            name="humor_flavor_id"
            required
            defaultValue={humorMixRow.humor_flavor_id}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          >
            {(humorFlavors ?? []).map((flavor) => (
              <option key={flavor.id} value={flavor.id}>
                {flavor.slug}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="caption_count"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Caption Count
          </label>
          <input
            id="caption_count"
            name="caption_count"
            type="number"
            required
            defaultValue={humorMixRow.caption_count}
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
            href="/admin/humor-mix"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
