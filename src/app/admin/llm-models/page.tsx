import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { formatDate } from "../_lib/crud";
import { getAdminPagination } from "../_lib/pagination";
import { deleteLlmModelAction } from "./actions";

type LlmModelRow = {
  id: number;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
  created_datetime_utc: string;
  llm_providers: { name: string | null } | { name: string | null }[] | null;
};

type LlmModelsPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    page?: string;
  }>;
};

function getProviderName(
  relatedProvider: { name: string | null } | { name: string | null }[] | null,
) {
  if (!relatedProvider) {
    return "-";
  }

  if (Array.isArray(relatedProvider)) {
    return relatedProvider[0]?.name ?? "-";
  }

  return relatedProvider.name ?? "-";
}

export default async function AdminLlmModelsPage({
  searchParams,
}: LlmModelsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: llmModels, error, count } = await supabase
    .from("llm_models")
    .select(
      "id, name, llm_provider_id, provider_model_id, is_temperature_supported, created_datetime_utc, llm_providers(name)",
      { count: "exact" },
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="LLM Models"
      description="Manage LLM model records."
      toolbar={
        <Link href="/admin/llm-models/new" className="admin-primary-button">
          New Model
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
          Unable to load LLM models right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">Name</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Provider
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Provider Model ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Temperature Support
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
            {llmModels && llmModels.length > 0 ? (
              (llmModels as LlmModelRow[]).map((model) => {
                const providerName = getProviderName(model.llm_providers);

                return (
                  <tr key={model.id}>
                    <td className="px-3 py-2 text-slate-700">{model.name}</td>
                    <td className="px-3 py-2 text-slate-700">{providerName}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {model.provider_model_id}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {model.is_temperature_supported ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(model.created_datetime_utc)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/llm-models/${model.id}/edit`}
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
                              Confirm delete for this model?
                            </p>
                            <form action={deleteLlmModelAction} className="mt-2">
                              <input type="hidden" name="id" value={model.id} />
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
                  colSpan={6}
                >
                  {error ? "Unable to display LLM models." : "No LLM models found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/llm-models"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="LLM models"
      />
    </AdminListShell>
  );
}
