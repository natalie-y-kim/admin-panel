import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { formatDate } from "../_lib/crud";
import { getAdminPagination } from "../_lib/pagination";

type HumorMixRow = {
  id: number;
  created_datetime_utc: string;
  humor_flavor_id: number;
  caption_count: number;
  humor_flavors: { slug: string | null } | { slug: string | null }[] | null;
};

type HumorMixPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
  }>;
};

function getHumorFlavorSlug(
  relatedFlavor: { slug: string | null } | { slug: string | null }[] | null,
) {
  if (!relatedFlavor) {
    return "-";
  }

  if (Array.isArray(relatedFlavor)) {
    return relatedFlavor[0]?.slug ?? "-";
  }

  return relatedFlavor.slug ?? "-";
}

export default async function AdminHumorMixPage({
  searchParams,
}: HumorMixPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: humorMixRows, error, count } = await supabase
    .from("humor_flavor_mix")
    .select("id, created_datetime_utc, humor_flavor_id, caption_count, humor_flavors(slug)", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="Humor Mix"
      description="Review and update humor flavor mix rows."
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

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load humor mix right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Flavor
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Flavor ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Caption Count
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
            {humorMixRows && humorMixRows.length > 0 ? (
              (humorMixRows as HumorMixRow[]).map((row) => {
                const humorFlavorSlug = getHumorFlavorSlug(row.humor_flavors);

                return (
                  <tr key={row.id}>
                    <td className="px-3 py-2 text-slate-700">{row.id}</td>
                    <td className="px-3 py-2 text-slate-700">{humorFlavorSlug}</td>
                    <td className="px-3 py-2 text-slate-700">{row.humor_flavor_id}</td>
                    <td className="px-3 py-2 text-slate-700">{row.caption_count}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(row.created_datetime_utc)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/humor-mix/${row.id}/edit`}
                        className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={6}
                >
                  {error ? "Unable to display humor mix." : "No humor mix rows found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/humor-mix"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="humor mix rows"
      />
    </AdminListShell>
  );
}
