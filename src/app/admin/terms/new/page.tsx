import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { createTermAction } from "../actions";

type NewTermsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewTermsPage({ searchParams }: NewTermsPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: termTypes } = await supabase
    .from("term_types")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">New Term</h1>
      <p className="mt-2 text-sm text-slate-600">Create a new glossary term.</p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}

      <form action={createTermAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="term"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Term
          </label>
          <input
            id="term"
            name="term"
            type="text"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="definition"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Definition
          </label>
          <textarea
            id="definition"
            name="definition"
            rows={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="example"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Example
          </label>
          <textarea
            id="example"
            name="example"
            rows={4}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="priority"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Priority
          </label>
          <input
            id="priority"
            name="priority"
            type="number"
            defaultValue={0}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="term_type_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Term Type
          </label>
          <select
            id="term_type_id"
            name="term_type_id"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
            defaultValue=""
          >
            <option value="">None</option>
            {(termTypes ?? []).map((termType) => (
              <option key={termType.id} value={termType.id}>
                {termType.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Create Term
          </button>
          <Link
            href="/admin/terms"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
