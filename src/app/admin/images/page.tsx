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
import { DeleteImageDialog } from "./_components/DeleteImageDialog";

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
  const searchQuery = getStringParam(params, "q");
  const publicFilter = getBooleanParam(params, "public");
  const profileId = getStringParam(params, "profileId");
  const view = getStringParam(params, "view") === "row" ? "row" : "grid";
  const pageSizeValue = view === "grid" ? 20 : 10;
  const { page, pageSize, from, to } = getAdminPagination(params, pageSizeValue);
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
      description="Browse visual assets in a grid layout or detailed row view with quick actions and information."
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <AdminViewToggle
            basePath="/admin/images"
            searchParams={params}
            currentView={view}
            options={[
              { key: "grid", label: "Grid" },
              { key: "row", label: "Row" },
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
              Grid view emphasizes the asset itself, its visibility state, and quick actions before lower-priority IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Default: Grid view</AdminBadge>
            <AdminBadge tone="neutral">Alternative: Row view</AdminBadge>
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
              href={view === "row" ? "/admin/images?view=row" : "/admin/images"}
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

      {view === "row" && images ? (
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
      ) : images && images.length > 0 ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <article
              key={image.id}
              className="admin-hover-card group relative overflow-visible rounded-2xl border bg-white p-0 transition dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="aspect-square overflow-hidden">
                {image.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt="Image preview"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {image.image_description ?? "Untitled image"}
                    </p>
                  </div>
                  <AdminBadge tone={image.is_public ? "success" : "neutral"}>
                    {image.is_public ? "Public" : "Private"}
                  </AdminBadge>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/images/${image.id}/edit`}
                      className="inline-flex rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Edit
                    </Link>
                    <DeleteImageDialog imageId={image.id} />
                  </div>

                  <details className="group/details relative">
                    <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100">
                      <svg
                        className="h-3 w-3 transition group-open/details:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="group-open/details:hidden">More</span>
                      <span className="hidden group-open/details:inline">Less</span>
                    </summary>

                    <div className="absolute bottom-full right-0 z-20 mb-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Full Description
                          </p>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {image.image_description ?? "No description provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Source URL
                          </p>
                          <p className="mt-1 break-all text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            {image.url ?? "No URL"}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Image ID
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                              {image.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Profile ID
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                              {image.profile_id ?? "No profile"}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Created
                          </p>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {formatDate(image.created_datetime_utc)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </details>
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
