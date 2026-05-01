import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
import { AdminInspector } from "../_components/AdminInspector";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { getAdminPagination } from "../_lib/pagination";

type LlmResponsesPageProps = {
  searchParams: Promise<{
    page?: string;
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
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const {
    data: responses,
    error,
    count,
  } = await supabase
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
      description="Inspect model activity in a readable operations stream with response previews, metadata, and expandable details."
    >
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Response stream
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Inspect model activity through response previews, key metadata,
              and expandable prompt details.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load LLM responses right now.
        </p>
      ) : null}

      {responses && responses.length > 0 ? (
        <div className="mt-5 space-y-4">
          {responses.map((response) => (
            <article
              key={response.id}
              className="admin-hover-card rounded-2xl border p-4 transition dark:border-slate-700"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="text-base font-semibold leading-6 text-slate-900 dark:text-slate-100">
                      {getLookupValue(response.llm_models as LlmLookup, "name")}
                    </p>

                    <AdminBadge tone="accent">
                      {response.processing_time_seconds}s
                    </AdminBadge>

                    <AdminBadge tone="neutral">
                      Temp {response.llm_temperature ?? "-"}
                    </AdminBadge>
                  </div>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {getLookupValue(response.profiles as LlmLookup, "email")} ·{" "}
                    {getLookupValue(
                      response.humor_flavors as LlmLookup,
                      "slug",
                    )}{" "}
                    · Request #{response.caption_request_id} ·{" "}
                    {formatDate(response.created_datetime_utc)}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Response Preview
                    </p>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {response.llm_model_response ?? "-"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Prompt Chain
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                        {response.llm_prompt_chain_id ?? "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Flavor Step
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                        {response.humor_flavor_step_id ?? "-"}
                      </p>
                    </div>
                  </div>

                  <AdminInspector
                    summary="Open details"
                    closedLabel="Open details"
                    openLabel="Close details"
                    className="mt-4 block"
                  >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.9fr)]">
                      <div className="space-y-4">
                        <section className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            LLM Response
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                            {response.llm_model_response ?? "-"}
                          </p>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            System Prompt
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                            {response.llm_system_prompt ?? "-"}
                          </p>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            User Prompt
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                            {response.llm_user_prompt ?? "-"}
                          </p>
                        </section>
                      </div>

                      <aside className="rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Response Metadata
                        </p>

                        <div className="mt-3 grid gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Response ID
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                              {response.id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Caption Request
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                              {response.caption_request_id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Prompt Chain
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                              {response.llm_prompt_chain_id ?? "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Flavor Step
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                              {response.humor_flavor_step_id ?? "-"}
                            </p>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </AdminInspector>
                </div>

                <div className="flex flex-wrap items-start gap-2 lg:w-56 lg:justify-end">
                  <AdminBadge tone="neutral">
                    Profile{" "}
                    {getLookupValue(response.profiles as LlmLookup, "email")}
                  </AdminBadge>

                  <AdminBadge tone="warning">
                    Flavor{" "}
                    {getLookupValue(
                      response.humor_flavors as LlmLookup,
                      "slug",
                    )}
                  </AdminBadge>
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