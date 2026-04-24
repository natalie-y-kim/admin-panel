import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
import { AdminInspector } from "../_components/AdminInspector";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminViewToggle } from "../_components/AdminViewToggle";
import { getStringParam } from "../_lib/filters";
import { getAdminPagination } from "../_lib/pagination";

type LlmResponsesPageProps = {
  searchParams: Promise<{
    page?: string;
    view?: string;
  }>;
};

type LlmLookup =
  | { email?: string | null; slug?: string | null; name?: string | null }
  | { email?: string | null; slug?: string | null; name?: string | null }[]
  | null;

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

function getLookupValue(value: LlmLookup, key: "email" | "slug" | "name") {
  if (!value) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value[0]?.[key] ?? "-";
  }

  return value[key] ?? "-";
}

export default async function AdminLlmResponsesPage({
  searchParams,
}: LlmResponsesPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const view = getStringParam(params, "view") === "table" ? "table" : "preview";
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: responses, error, count } = await supabase
    .from("llm_model_responses")
    .select(
      "id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id, llm_system_prompt, llm_user_prompt, llm_temperature, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id, llm_models(name), profiles!llm_model_responses_profile_id_fkey(email), humor_flavors(slug)",
      { count: "exact" },
    )
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <AdminListShell
      title="LLM Responses"
      description="Inspect model activity in an operations stream, then switch to the dense table when you need raw field comparison."
      toolbar={
        <AdminViewToggle
          basePath="/admin/llm-responses"
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
            <p className="text-sm font-semibold text-slate-900">Response stream</p>
            <p className="mt-1 text-sm text-slate-600">
              Preview emphasizes model, timing, flavor, and prompt context before low-signal IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Default view: Preview</AdminBadge>
            <AdminBadge tone="neutral">Dense fallback: Table</AdminBadge>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load LLM responses right now.
        </p>
      ) : null}

      {view === "table" ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Model
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Profile
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Flavor
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Caption Request
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Prompt Chain
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Step
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Temp
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Time (s)
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Created (UTC)
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900">
              {responses && responses.length > 0 ? (
                responses.map((response) => (
                  <tr key={response.id}>
                    <td className="px-2 py-1 align-top font-mono text-xs text-slate-700">
                      {response.id}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {getLookupValue(response.llm_models as LlmLookup, "name")}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {getLookupValue(response.profiles as LlmLookup, "email")}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {getLookupValue(response.humor_flavors as LlmLookup, "slug")}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {response.caption_request_id}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {response.llm_prompt_chain_id ?? "-"}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {response.humor_flavor_step_id ?? "-"}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {response.llm_temperature ?? "-"}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {response.processing_time_seconds}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      {formatDate(response.created_datetime_utc)}
                    </td>
                    <td className="px-2 py-1 align-top text-slate-700">
                      <AdminInspector summary="View" className="min-w-32">
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              LLM Response
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                              {response.llm_model_response ?? "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              System Prompt
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                              {response.llm_system_prompt}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              User Prompt
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                              {response.llm_user_prompt}
                            </p>
                          </div>
                        </div>
                      </AdminInspector>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={11}
                  >
                    {error
                      ? "Unable to display LLM responses."
                      : "No LLM responses found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : responses && responses.length > 0 ? (
        <div className="mt-5 space-y-4">
          {responses.map((response) => (
            <article
              key={response.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="text-base font-semibold leading-6 text-slate-900">
                      {getLookupValue(response.llm_models as LlmLookup, "name")}
                    </p>
                    <AdminBadge tone="accent">
                      {response.processing_time_seconds}s
                    </AdminBadge>
                    <AdminBadge tone="neutral">
                      Temp {response.llm_temperature ?? "-"}
                    </AdminBadge>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {getLookupValue(response.profiles as LlmLookup, "email")} ·{" "}
                    {getLookupValue(response.humor_flavors as LlmLookup, "slug")} ·{" "}
                    Request #{response.caption_request_id} ·{" "}
                    {formatDate(response.created_datetime_utc)}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Response Preview
                    </p>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">
                      {response.llm_model_response ?? "-"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Prompt Chain
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {response.llm_prompt_chain_id ?? "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Flavor Step
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {response.humor_flavor_step_id ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-2 lg:w-56 lg:justify-end">
                  <AdminBadge tone="neutral">
                    Profile {getLookupValue(response.profiles as LlmLookup, "email")}
                  </AdminBadge>
                  <AdminBadge tone="warning">
                    Flavor {getLookupValue(response.humor_flavors as LlmLookup, "slug")}
                  </AdminBadge>
                  <AdminInspector
                    summary="Open details"
                    closedLabel="Open details"
                    openLabel="Close details"
                    className="w-full lg:text-right"
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            LLM Response
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                            {response.llm_model_response ?? "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            System Prompt
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                            {response.llm_system_prompt}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            User Prompt
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                            {response.llm_user_prompt}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Response ID
                          </p>
                          <p className="mt-1 break-all font-mono text-xs text-slate-700">
                            {response.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Caption Request
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {response.caption_request_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Prompt Chain
                          </p>
                          <p className="mt-1 break-all font-mono text-xs text-slate-700">
                            {response.llm_prompt_chain_id ?? "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Flavor Step
                          </p>
                          <p className="mt-1 break-all font-mono text-xs text-slate-700">
                            {response.humor_flavor_step_id ?? "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AdminInspector>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          {error ? "Unable to display LLM responses." : "No LLM responses found."}
        </div>
      )}
      <AdminPagination
        basePath="/admin/llm-responses"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="LLM responses"
      />
    </AdminListShell>
  );
}
