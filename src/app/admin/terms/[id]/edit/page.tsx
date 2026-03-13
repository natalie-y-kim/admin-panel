import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { updateTermAction } from "../../actions";

type EditTermsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditTermsPage({
  params,
  searchParams,
}: EditTermsPageProps) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: term, error }, { data: termTypes }] = await Promise.all([
    supabase
      .from("terms")
      .select("id, term, definition, example, priority, term_type_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("term_types").select("id, name").order("name", { ascending: true }),
  ]);

  if (error) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Term</h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load this term right now.
        </p>
        <Link
          href="/admin/terms"
          className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Terms
        </Link>
      </section>
    );
  }

  if (!term) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Term</h1>
      <p className="mt-2 text-sm text-slate-600">Update term fields and save.</p>

      {query.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}

      <form action={updateTermAction} className="mt-6 space-y-5">
        <input type="hidden" name="id" value={term.id} />

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
            defaultValue={term.term}
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
            defaultValue={term.definition}
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
            defaultValue={term.example}
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
            required
            defaultValue={term.priority}
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
            defaultValue={term.term_type_id ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 focus:ring-2"
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
            Save Changes
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
