import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { formatDate } from "../_lib/crud";
import { getAdminPagination } from "../_lib/pagination";
import { deleteLlmProviderAction } from "./actions";

type LlmProvidersPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
  }>;
};

export default async function AdminLlmProvidersPage({
  searchParams,
}: LlmProvidersPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: llmProviders, error, count } = await supabase
    .from("llm_providers")
    .select("id, name, created_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="LLM Providers"
      description="Manage LLM provider records."
      toolbar={
        <Link href="/admin/llm-providers/new" className="admin-primary-button">
          New Provider
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
          Unable to load LLM providers right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">Name</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {llmProviders && llmProviders.length > 0 ? (
              llmProviders.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-3 py-2 text-slate-700">{provider.name}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(provider.created_datetime_utc)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/llm-providers/${provider.id}/edit`}
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
                            Confirm delete for this provider?
                          </p>
                          <form action={deleteLlmProviderAction} className="mt-2">
                            <input type="hidden" name="id" value={provider.id} />
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
                  colSpan={3}
                >
                  {error
                    ? "Unable to display LLM providers."
                    : "No LLM providers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/llm-providers"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="LLM providers"
      />
    </AdminListShell>
  );
}
