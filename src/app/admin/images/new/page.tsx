import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createImageAction } from "../actions";

type NewImagePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewImagePage({ searchParams }: NewImagePageProps) {
  await requireSuperadmin();
  const params = await searchParams;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New Image</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new image record.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createImageAction} className="mt-6 space-y-5">
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
            placeholder="https://example.com/image.jpg"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          Is Public
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Create Image
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
