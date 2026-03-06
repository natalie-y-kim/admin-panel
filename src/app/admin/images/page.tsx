import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { deleteImageAction } from "./actions";

type AdminImagesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export default async function AdminImagesPage({
  searchParams,
}: AdminImagesPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, image_description, is_public, profile_id, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false });

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Images</h1>
          <p className="mt-2 text-sm text-slate-600">Manage image records.</p>
        </div>
        <Link
          href="/admin/images/new"
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          New Image
        </Link>
      </div>

      {params.success ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {params.success}
        </p>
      ) : null}

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load images right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Thumbnail
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Description
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Public
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Profile ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {images && images.length > 0 ? (
              images.map((image) => (
                <tr key={image.id}>
                  <td className="px-3 py-2">
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.url}
                        alt="Image thumbnail"
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="max-w-lg px-3 py-2 text-slate-700">
                    {image.image_description ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {image.is_public ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {image.profile_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(image.created_datetime_utc)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/images/${image.id}/edit`}
                        className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <details className="relative">
                        <summary className="inline-flex cursor-pointer list-none rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50">
                          Delete
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
                          <p className="text-xs text-slate-600">
                            Confirm delete for this image?
                          </p>
                          <form action={deleteImageAction} className="mt-2">
                            <input type="hidden" name="id" value={image.id} />
                            <button
                              type="submit"
                              className="w-full rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500"
                            >
                              Confirm Delete
                            </button>
                          </form>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={6}
                >
                  {error ? "Unable to display images." : "No images found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
