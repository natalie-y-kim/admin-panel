import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateImageAction } from "../../actions";

type EditImagePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditImagePage({
  params,
  searchParams,
}: EditImagePageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: image, error } = await supabase
    .from("images")
    .select("id, url, image_description, is_public")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Image</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this image right now.
        </p>
        <Link
          href="/admin/images"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Images
        </Link>
      </section>
    );
  }

  if (!image) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Image</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update image fields and save changes.
      </p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateImageAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={image.id} />

        <div>
          <label
            htmlFor="url"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            required
            defaultValue={image.url ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2"
          />
        </div>

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
            rows={4}
            defaultValue={image.image_description ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            defaultChecked={Boolean(image.is_public)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          Is Public
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="admin-primary-button"
          >
            Save Changes
          </button>
          <Link
            href="/admin/images"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
