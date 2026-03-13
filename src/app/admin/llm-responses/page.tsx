import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

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

export default async function AdminLlmResponsesPage() {
  await requireSuperadmin();
  const supabase = await createClient();

  const { data: responses, error } = await supabase
    .from("llm_model_responses")
    .select(
      "id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id, llm_system_prompt, llm_user_prompt, llm_temperature, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id, llm_models(name), profiles(email), humor_flavors(slug)",
    )
    .order("created_datetime_utc", { ascending: false });

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">LLM Responses</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read-only LLM response list with model, profile, and flavor lookups.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load LLM responses right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
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
                Response
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
            {responses && responses.length > 0 ? (
              responses.map((response) => (
                <tr key={response.id}>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {response.id}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(response.llm_models as LlmLookup, "name")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(response.profiles as LlmLookup, "email")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {getLookupValue(response.humor_flavors as LlmLookup, "slug")}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {response.caption_request_id}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {response.llm_prompt_chain_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {response.humor_flavor_step_id ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {response.llm_temperature ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {response.processing_time_seconds}
                  </td>
                  <td className="max-w-sm px-3 py-2 text-slate-700">
                    {response.llm_model_response ?? "-"}
                  </td>
                  <td className="max-w-sm px-3 py-2 text-slate-700">
                    {response.llm_system_prompt}
                  </td>
                  <td className="max-w-sm px-3 py-2 text-slate-700">
                    {response.llm_user_prompt}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(response.created_datetime_utc)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={13}
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
    </section>
  );
}
