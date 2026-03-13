import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

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

export default async function AdminHumorFlavorsPage() {
  await requireSuperadmin();
  const supabase = await createClient();

  const { data: humorFlavors, error } = await supabase
    .from("humor_flavors")
    .select("id, created_datetime_utc, slug, description")
    .order("id", { ascending: true });

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Humor Flavors</h1>
      <p className="mt-2 text-sm text-slate-600">Read-only humor flavor list.</p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load humor flavors right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">ID</th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Slug
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Description
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {humorFlavors && humorFlavors.length > 0 ? (
              humorFlavors.map((flavor) => (
                <tr key={flavor.id}>
                  <td className="px-3 py-2 text-slate-700">{flavor.id}</td>
                  <td className="px-3 py-2 text-slate-700">{flavor.slug}</td>
                  <td className="max-w-xl px-3 py-2 text-slate-700">
                    {flavor.description ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(flavor.created_datetime_utc)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={4}
                >
                  {error
                    ? "Unable to display humor flavors."
                    : "No humor flavors found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
