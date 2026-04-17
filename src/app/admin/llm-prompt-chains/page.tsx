import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminPagination } from "../_components/AdminPagination";
import { getAdminPagination } from "../_lib/pagination";

type LlmPromptChainsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

type PromptChainLookup = { profile_id?: string | null; image_id?: string | null } | { profile_id?: string | null; image_id?: string | null }[] | null;

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

function getLookupValue(value: PromptChainLookup, key: "profile_id" | "image_id") {
  if (!value) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value[0]?.[key] ?? "-";
  }

  return value[key] ?? "-";
}

export default async function AdminLlmPromptChainsPage({
  searchParams,
}: LlmPromptChainsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const supabase = await createClient();

  const { data: promptChains, error, count } = await supabase
    .from("llm_prompt_chains")
    .select("id, created_datetime_utc, caption_request_id, caption_requests(profile_id, image_id)", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">LLM Prompt Chains</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read-only prompt chain list with caption request lookups.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load LLM prompt chains right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Caption Request ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Request Profile ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Request Image ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {promptChains && promptChains.length > 0 ? (
              promptChains.map((chain) => (
                <tr key={chain.id}>
                  <td className="px-3 py-2 text-slate-700">{chain.id}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {chain.caption_request_id}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {getLookupValue(
                      chain.caption_requests as PromptChainLookup,
                      "profile_id",
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {getLookupValue(
                      chain.caption_requests as PromptChainLookup,
                      "image_id",
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(chain.created_datetime_utc)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={5}
                >
                  {error
                    ? "Unable to display LLM prompt chains."
                    : "No LLM prompt chains found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/llm-prompt-chains"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="prompt chains"
      />
    </section>
  );
}
