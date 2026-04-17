import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { createLlmModelAction } from "../actions";

type NewLlmModelsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewLlmModelsPage({
  searchParams,
}: NewLlmModelsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: llmProviders } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New LLM Model</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new LLM model record.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createLlmModelAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="llm_provider_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Provider
          </label>
          <select
            id="llm_provider_id"
            name="llm_provider_id"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          >
            <option value="" disabled>
              Select a provider
            </option>
            {(llmProviders ?? []).map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="provider_model_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Provider Model ID
          </label>
          <input
            id="provider_model_id"
            name="provider_model_id"
            type="text"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            id="is_temperature_supported"
            name="is_temperature_supported"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          Temperature Supported
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          >
            Create Model
          </button>
          <Link
            href="/admin/llm-models"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
