import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
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
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Humor Flavor Steps</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read-only humor flavor step list with reference lookups.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load humor flavor steps right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Flavor
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Order
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Step Type
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Model
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Input Type
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Output Type
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Temp
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Description
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                System Prompt
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                User Prompt
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {steps && steps.length > 0 ? (
              steps.map((step) => (
                <tr key={step.id}>
                  <td className="px-3 py-2 text-slate-700">{step.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(step.humor_flavors as StepLookup, "slug")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{step.order_by}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(
                      step.humor_flavor_step_types as StepLookup,
                      "slug",
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(step.llm_models as StepLookup, "name")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(step.llm_input_types as StepLookup, "slug")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(step.llm_output_types as StepLookup, "slug")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {step.llm_temperature ?? "-"}
                  </td>
                  <td className="max-w-xs px-3 py-2 text-slate-700">
                    {step.description ?? "-"}
                  </td>
                  <td className="max-w-sm px-3 py-2 text-slate-700">
                    {step.llm_system_prompt ?? "-"}
                  </td>
                  <td className="max-w-sm px-3 py-2 text-slate-700">
                    {step.llm_user_prompt ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(step.created_datetime_utc)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={12}
                >
                  {error
                    ? "Unable to display humor flavor steps."
                    : "No humor flavor steps found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/humor-flavor-steps"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="flavor steps"
      />
    </section>
  );
}
