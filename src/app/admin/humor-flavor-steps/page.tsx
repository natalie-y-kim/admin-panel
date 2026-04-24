import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
import { AdminInspector } from "../_components/AdminInspector";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { getAdminPagination } from "../_lib/pagination";

type HumorFlavorStepsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

type StepLookup =
  | { slug?: string | null; name?: string | null }
  | { slug?: string | null; name?: string | null }[]
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

function getLookupValue(value: StepLookup, key: "slug" | "name") {
  if (!value) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value[0]?.[key] ?? "-";
  }

  return value[key] ?? "-";
}

export default async function AdminHumorFlavorStepsPage({
  searchParams,
}: HumorFlavorStepsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: steps, error, count } = await supabase
    .from("humor_flavor_steps")
    .select(
      "id, created_datetime_utc, humor_flavor_id, llm_temperature, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_system_prompt, llm_user_prompt, description, humor_flavors(slug), llm_input_types(slug), llm_output_types(slug), llm_models(name), humor_flavor_step_types(slug)",
      { count: "exact" },
    )
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true })
    .range(from, to);

  return (
    <AdminListShell
      title="Humor Flavor Steps"
      description="Read-only flavor step preview with key model and prompt references surfaced first."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Flavor step browser
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Preview emphasizes sequence, model choice, and prompt context before full record detail.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Preview layout</AdminBadge>
            <AdminBadge tone="neutral">Read only</AdminBadge>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load humor flavor steps right now.
        </p>
      ) : null}

      {steps && steps.length > 0 ? (
        <div className="mt-5 space-y-4">
          {steps.map((step) => {
            const flavorSlug = getLookupValue(
              step.humor_flavors as StepLookup,
              "slug",
            );
            const stepType = getLookupValue(
              step.humor_flavor_step_types as StepLookup,
              "slug",
            );
            const modelName = getLookupValue(step.llm_models as StepLookup, "name");
            const inputType = getLookupValue(
              step.llm_input_types as StepLookup,
              "slug",
            );
            const outputType = getLookupValue(
              step.llm_output_types as StepLookup,
              "slug",
            );

            return (
              <article
                key={step.id}
                className="admin-hover-card rounded-2xl border p-4 transition dark:border-slate-700"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminBadge tone="accent">{flavorSlug}</AdminBadge>
                    <AdminBadge tone="neutral">Step {step.order_by}</AdminBadge>
                    <AdminBadge tone="warning">{stepType}</AdminBadge>
                  </div>

                  <p className="mt-4 text-base font-semibold leading-6 text-slate-900 dark:text-slate-100">
                    {step.description ?? "No description provided"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Created {formatDate(step.created_datetime_utc)}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Model
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {modelName}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Input Type
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {inputType}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Output Type
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {outputType}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Temperature
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {step.llm_temperature ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <AdminInspector
                      summary="Open details"
                      closedLabel="Open details"
                      openLabel="Close details"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              System Prompt
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                              {step.llm_system_prompt ?? "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              User Prompt
                            </p>
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                              {step.llm_user_prompt ?? "-"}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Step ID
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                              {step.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Flavor ID
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                              {step.humor_flavor_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Model
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                              {modelName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Created (UTC)
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                              {formatDate(step.created_datetime_utc)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AdminInspector>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          {error
            ? "Unable to display humor flavor steps."
            : "No humor flavor steps found."}
        </div>
      )}
      <AdminPagination
        basePath="/admin/humor-flavor-steps"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="flavor steps"
      />
    </AdminListShell>
  );
}
