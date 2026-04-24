import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
import { AdminInspector } from "../_components/AdminInspector";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminViewToggle } from "../_components/AdminViewToggle";
import {
  getBooleanParam,
  getLikePattern,
  getStringParam,
  hasAdminFilters,
} from "../_lib/filters";
import { getAdminPagination } from "../_lib/pagination";
import { deleteImageAction } from "./actions";

type AdminImagesPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
    q?: string;
    public?: string;
    profileId?: string;
    view?: string;
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
  const { page, pageSize, from, to } = getAdminPagination(params);
  const searchQuery = getStringParam(params, "q");
  const publicFilter = getBooleanParam(params, "public");
  const profileId = getStringParam(params, "profileId");
  const view = getStringParam(params, "view") === "table" ? "table" : "preview";
  const hasFilters = hasAdminFilters(params, ["q", "public", "profileId"]);
  const supabase = await createClient();

  let imagesQuery = supabase
    .from("images")
    .select("id, url, image_description, is_public, profile_id, created_datetime_utc", {
      count: "exact",
    });

  if (searchQuery) {
    const likePattern = getLikePattern(searchQuery);
    imagesQuery = imagesQuery.or(
      `image_description.ilike.${likePattern},url.ilike.${likePattern}`,
    );
  }

  if (publicFilter !== null) {
    imagesQuery = imagesQuery.eq("is_public", publicFilter);
  }

  if (profileId) {
    imagesQuery = imagesQuery.eq("profile_id", profileId);
  }

  const { data: images, error, count } = await imagesQuery
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="Images"
      description="Review visual assets in a contact-sheet style layout, then switch to a dense table when you need raw comparison."
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <AdminViewToggle
            basePath="/admin/images"
            searchParams={params}
            currentView={view}
            options={[
              { key: "preview", label: "Preview" },
              { key: "table", label: "Table" },
            ]}
          />
          <Link
            href="/admin/images/new"
            className="admin-primary-button"
          >
            New Image
          </Link>
        </div>
      }
    >

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

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Image browser</p>
            <p className="mt-1 text-sm text-slate-600">
              Preview emphasizes the asset itself, its visibility state, and quick actions before lower-priority IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Default view: Preview</AdminBadge>
            <AdminBadge tone="neutral">Dense fallback: Table</AdminBadge>
          </div>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)_auto_auto]">
          <input type="hidden" name="view" value={view} />
          <label className="text-sm text-slate-700">
            <span className="font-medium">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Description or URL"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="font-medium">Public</span>
            <select
              name="public"
              defaultValue={getStringParam(params, "public")}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            <span className="font-medium">Profile ID</span>
            <input
              type="search"
              name="profileId"
              defaultValue={profileId}
              placeholder="Exact UUID"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="admin-primary-button self-end"
          >
            Apply
          </button>
          {hasFilters ? (
            <Link
              href={view === "table" ? "/admin/images?view=table" : "/admin/images"}
              className="self-end rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load images right now.
        </p>
      ) : null}

      {view === "table" ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
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
            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900">
              {images && images.length > 0 ? (
                images.map((image) => (
                  <tr key={image.id}>
                    <td className="px-3 py-2">
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt="Image thumbnail"
                          className="h-12 w-12 rounded-lg object-cover"
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
                    {error
                      ? "Unable to display images."
                      : hasFilters
                        ? "No images match these filters."
                        : "No images found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : images && images.length > 0 ? (
        <div className="mt-5 space-y-4">
          {images.map((image) => (
            <article
              key={image.id}
              className="admin-hover-card rounded-2xl border p-4 transition dark:border-slate-700"
            >
              <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
                <div className="shrink-0">
                  {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt="Image preview"
                      className="h-28 w-28 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-6 text-slate-900">
                        {image.image_description ?? "Untitled image"}
                      </p>
                      <p className="mt-2 truncate text-sm text-slate-500">
                        {image.url ?? "-"}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Created {formatDate(image.created_datetime_utc)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:w-52 lg:justify-end">
                      <AdminBadge tone={image.is_public ? "success" : "neutral"}>
                        {image.is_public ? "Public" : "Private"}
                      </AdminBadge>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Profile ID
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-700">
                        {image.profile_id ?? "-"}
                      </p>
                    </div>

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
                        <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
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
                      <AdminInspector
                        summary="Open details"
                        closedLabel="Open details"
                        openLabel="Close details"
                      >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Source URL
                            </p>
                            <p className="mt-2 break-all text-sm text-slate-700">
                              {image.url ?? "-"}
                            </p>
                          </div>
                          <div className="grid gap-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Image ID
                              </p>
                              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                                {image.id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Profile ID
                              </p>
                              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                                {image.profile_id ?? "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AdminInspector>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          {error
            ? "Unable to display images."
            : hasFilters
              ? "No images match these filters."
              : "No images found."}
        </div>
      )}
      <AdminPagination
        basePath="/admin/images"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="images"
      />
    </AdminListShell>
  );
}
