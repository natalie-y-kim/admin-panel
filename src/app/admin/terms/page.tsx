import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { formatDate } from "../_lib/crud";
import { getAdminPagination } from "../_lib/pagination";
import { deleteTermAction } from "./actions";

type TermRow = {
  id: number;
  term: string;
  definition: string;
  example: string;
  priority: number;
  term_type_id: number | null;
  created_datetime_utc: string;
  term_types: { name: string | null } | { name: string | null }[] | null;
};

type TermsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
  }>;
};

function getTermTypeName(
  relatedTermType: { name: string | null } | { name: string | null }[] | null,
) {
  if (!relatedTermType) {
    return "-";
  }

  if (Array.isArray(relatedTermType)) {
    return relatedTermType[0]?.name ?? "-";
  }

  return relatedTermType.name ?? "-";
}

export default async function AdminTermsPage({ searchParams }: TermsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: terms, error, count } = await supabase
    .from("terms")
    .select(
      "id, term, definition, example, priority, term_type_id, created_datetime_utc, term_types(name)",
      { count: "exact" },
    )
    .order("priority", { ascending: false })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="Terms"
      description="Manage glossary terms."
      toolbar={
        <Link href="/admin/terms/new" className="admin-primary-button">
          New Term
        </Link>
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

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load terms right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">Term</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Definition
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Example
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Priority
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Term Type
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
            {terms && terms.length > 0 ? (
              (terms as TermRow[]).map((term) => {
                const termTypeName = getTermTypeName(term.term_types);

                return (
                  <tr key={term.id}>
                    <td className="px-3 py-2 text-slate-700">{term.term}</td>
                    <td className="max-w-sm px-3 py-2 text-slate-700">
                      {term.definition}
                    </td>
                    <td className="max-w-sm px-3 py-2 text-slate-700">
                      {term.example}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{term.priority}</td>
                    <td className="px-3 py-2 text-slate-700">{termTypeName}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(term.created_datetime_utc)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/terms/${term.id}/edit`}
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
                              Confirm delete for this term?
                            </p>
                            <form action={deleteTermAction} className="mt-2">
                              <input type="hidden" name="id" value={term.id} />
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
                );
              })
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={7}
                >
                  {error ? "Unable to display terms." : "No terms found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/terms"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="terms"
      />
    </AdminListShell>
  );
}
