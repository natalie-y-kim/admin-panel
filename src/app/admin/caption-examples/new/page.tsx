import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { createCaptionExampleAction } from "../actions";

type NewCaptionExamplesPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewCaptionExamplesPage({
  searchParams,
}: NewCaptionExamplesPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: images } = await supabase
    .from("images")
    .select("id, url")
    .order("created_datetime_utc", { ascending: false });

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New Caption Example</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new caption example.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createCaptionExampleAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="image_description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Image Description
          </label>
          <textarea
            id="image_description"
            name="image_description"
            rows={3}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="caption"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Caption
          </label>
          <textarea
            id="caption"
            name="caption"
            rows={3}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="explanation"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Explanation
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <input
            id="priority"
            name="priority"
            type="number"
            defaultValue={0}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="image_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Image
          </label>
          <select
            id="image_id"
            name="image_id"
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          >
            <option value="">None</option>
            {(images ?? []).map((image) => (
              <option key={image.id} value={image.id}>
                {image.url ?? image.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="admin-primary-button"
          >
            Create Example
          </button>
          <Link
            href="/admin/caption-examples"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
