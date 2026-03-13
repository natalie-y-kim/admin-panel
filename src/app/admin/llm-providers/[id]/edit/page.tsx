import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateLlmProviderAction } from "../../actions";

type EditLlmProvidersPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditLlmProvidersPage({
  params,
  searchParams,
}: EditLlmProvidersPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: llmProvider, error } = await supabase
    .from("llm_providers")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit LLM Provider</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this LLM provider right now.
        </p>
        <Link
          href="/admin/llm-providers"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to LLM Providers
        </Link>
      </section>
    );
  }

  if (!llmProvider) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit LLM Provider</h1>
      <p className="mt-2 text-sm text-slate-600">Update provider fields and save.</p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateLlmProviderAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={llmProvider.id} />

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
            defaultValue={llmProvider.name}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Save Changes
          </button>
          <Link
            href="/admin/llm-providers"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
