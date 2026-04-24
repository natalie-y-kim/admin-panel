import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
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

type CaptionsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    public?: string;
    featured?: string;
    profileId?: string;
    imageId?: string;
    view?: string;
  }>;
};

type CaptionWithImage = {
  id: string;
  content: string | null;
  profile_id: string;
  image_id: string;
  like_count: number;
  is_public: boolean;
  is_featured: boolean;
  created_datetime_utc: string;
  images: { url: string | null } | { url: string | null }[] | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function getImageUrl(
  relatedImage: { url: string | null } | { url: string | null }[] | null,
) {
  if (!relatedImage) {
    return null;
  }

  if (Array.isArray(relatedImage)) {
    return relatedImage[0]?.url ?? null;
  }

  return relatedImage.url;
}

export default async function AdminCaptionsPage({
  searchParams,
}: CaptionsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params, 20);
  const searchQuery = getStringParam(params, "q");
  const publicFilter = getBooleanParam(params, "public");
  const featuredFilter = getBooleanParam(params, "featured");
  const profileId = getStringParam(params, "profileId");
  const imageId = getStringParam(params, "imageId");
  const view = getStringParam(params, "view") === "table" ? "table" : "preview";
  const hasFilters = hasAdminFilters(params, [
    "q",
    "public",
    "featured",
    "profileId",
    "imageId",
  ]);
  const supabase = await createClient();

  let captionsQuery = supabase
    .from("captions")
    .select(
      "id, content, profile_id, image_id, like_count, is_public, is_featured, created_datetime_utc, images(url)",
      { count: "exact" },
    );

  if (searchQuery) {
    captionsQuery = captionsQuery.ilike("content", getLikePattern(searchQuery));
  }

  if (publicFilter !== null) {
    captionsQuery = captionsQuery.eq("is_public", publicFilter);
  }

  if (featuredFilter !== null) {
    captionsQuery = captionsQuery.eq("is_featured", featuredFilter);
  }

  if (profileId) {
    captionsQuery = captionsQuery.eq("profile_id", profileId);
  }

  if (imageId) {
    captionsQuery = captionsQuery.eq("image_id", imageId);
  }

  const { data, error, count } = await captionsQuery
    .order("created_datetime_utc", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  const captions: CaptionWithImage[] = (data ?? []).map((row) => ({
    id: row.id as string,
    content: row.content as string | null,
    profile_id: row.profile_id as string,
    image_id: row.image_id as string,
    like_count: row.like_count as number,
    is_public: row.is_public as boolean,
    is_featured: row.is_featured as boolean,
    created_datetime_utc: row.created_datetime_utc as string,
    images: row.images as
      | { url: string | null }
      | { url: string | null }[]
      | null,
  }));

  console.log("[admin/captions] pagination", {
    page,
    pageSize,
    from,
    to,
    count,
    returnedCount: captions.length,
    captionIds: captions.slice(0, 5).map((caption) => caption.id),
  });

  return (
    <AdminListShell
      title="Captions"
      description="Review caption performance in a preview-first layout, then switch to a dense table when you need comparison mode."
      toolbar={
        <AdminViewToggle
          basePath="/admin/captions"
          searchParams={params}
          currentView={view}
          options={[
            { key: "preview", label: "Preview" },
            { key: "table", label: "Table" },
          ]}
        />
      }
    >
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Caption browser</p>
            <p className="mt-1 text-sm text-slate-600">
              Preview emphasizes image context, moderation state, and engagement before raw IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Default view: Preview</AdminBadge>
            <AdminBadge tone="neutral">Dense fallback: Table</AdminBadge>
          </div>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_9rem_9rem_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <input type="hidden" name="view" value={view} />
          <label className="text-sm text-slate-700">
            <span className="font-medium">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Caption text"
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
            <span className="font-medium">Featured</span>
            <select
              name="featured"
              defaultValue={getStringParam(params, "featured")}
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
          <label className="text-sm text-slate-700">
            <span className="font-medium">Image ID</span>
            <input
              type="search"
              name="imageId"
              defaultValue={imageId}
              placeholder="Exact UUID"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Apply
          </button>
          {hasFilters ? (
            <Link
              href={view === "table" ? "/admin/captions?view=table" : "/admin/captions"}
              className="self-end rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load captions right now.
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
                  Content
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Profile ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Image ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Likes
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Public
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Featured
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Created (UTC)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900">
              {captions.length > 0 ? (
                captions.map((caption) => {
                  const imageUrl = getImageUrl(caption.images);

                  return (
                    <tr key={caption.id}>
                      <td className="px-3 py-2">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt="Caption image"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="max-w-lg px-3 py-2 text-slate-700">
                        {caption.content ?? "-"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">
                        {caption.profile_id}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">
                        {caption.image_id}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {caption.like_count}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {caption.is_public ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {caption.is_featured ? "Yes" : "No"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {formatDate(caption.created_datetime_utc)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={8}
                  >
                    {error
                      ? "Unable to display captions."
                      : hasFilters
                        ? "No captions match these filters."
                        : "No captions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : captions.length > 0 ? (
        <div className="mt-5 space-y-4">
          {captions.map((caption) => {
            const imageUrl = getImageUrl(caption.images);

            return (
              <article
                key={caption.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
                  <div className="shrink-0">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Caption image"
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 dark:bg-slate-800">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Full caption
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-base font-semibold leading-6 text-slate-900">
                          {caption.content ?? "-"}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Created {formatDate(caption.created_datetime_utc)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:w-52 lg:justify-end">
                        <AdminBadge tone="accent">{caption.like_count} likes</AdminBadge>
                        <AdminBadge tone={caption.is_public ? "success" : "neutral"}>
                          {caption.is_public ? "Public" : "Private"}
                        </AdminBadge>
                        <AdminBadge tone={caption.is_featured ? "warning" : "neutral"}>
                          {caption.is_featured ? "Featured" : "Standard"}
                        </AdminBadge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Caption ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-700">
                          {caption.id}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Profile ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-700">
                          {caption.profile_id}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Image ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-slate-700">
                          {caption.image_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          {error
            ? "Unable to display captions."
            : hasFilters
              ? "No captions match these filters."
              : "No captions found."}
        </div>
      )}
      <AdminPagination
        basePath="/admin/captions"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="captions"
      />
    </AdminListShell>
  );
}
