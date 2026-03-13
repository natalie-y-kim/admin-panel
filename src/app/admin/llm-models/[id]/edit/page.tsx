import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateLlmModelAction } from "../../actions";

type EditLlmModelsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditLlmModelsPage({
  params,
  searchParams,
}: EditLlmModelsPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: llmModel, error }, { data: llmProviders }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, llm_provider_id, provider_model_id, is_temperature_supported")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("llm_providers").select("id, name").order("name", { ascending: true }),
  ]);

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit LLM Model</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this LLM model right now.
        </p>
        <Link
          href="/admin/llm-models"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to LLM Models
        </Link>
      </section>
    );
  }

  if (!llmModel) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit LLM Model</h1>
      <p className="mt-2 text-sm text-slate-600">Update model fields and save.</p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateLlmModelAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={llmModel.id} />

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
            defaultValue={llmModel.name}
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
            defaultValue={llmModel.llm_provider_id}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          >
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
            defaultValue={llmModel.provider_model_id}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            id="is_temperature_supported"
            name="is_temperature_supported"
            type="checkbox"
            defaultChecked={llmModel.is_temperature_supported}
            className="h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          Temperature Supported
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Save Changes
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
