import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { getAdminPagination } from "../_lib/pagination";

type CaptionRequestsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

type RelatedRecord = { email?: string | null; url?: string | null } | { email?: string | null; url?: string | null }[] | null;

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function getRelatedValue(value: RelatedRecord, key: "email" | "url") {
  if (!value) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value[0]?.[key] ?? "-";
  }

  return value[key] ?? "-";
}

export default async function AdminCaptionRequestsPage({
  searchParams,
}: CaptionRequestsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: captionRequests, error, count } = await supabase
    .from("caption_requests")
    .select(
      "id, created_datetime_utc, profile_id, image_id, profiles!caption_requests_profile_id_fkey(email), images(url)",
      { count: "exact" },
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="Caption Requests"
      description="Read-only caption request list with profile and image lookups."
    >
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load caption requests right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Profile Email
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Profile ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Image ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Image URL
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {captionRequests && captionRequests.length > 0 ? (
              captionRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-3 py-2 text-slate-700">{request.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {getRelatedValue(request.profiles as RelatedRecord, "email")}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {request.profile_id}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {request.image_id}
                  </td>
                  <td className="max-w-md px-3 py-2 text-slate-700">
                    {getRelatedValue(request.images as RelatedRecord, "url")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(request.created_datetime_utc)}
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
                    ? "Unable to display caption requests."
                    : "No caption requests found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/caption-requests"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="caption requests"
      />
    </AdminListShell>
  );
}
