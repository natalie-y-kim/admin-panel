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

export default async function AdminUsersPage() {
  await requireSuperadmin();
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false });

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-2 text-sm text-slate-600">Read-only user directory.</p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load users right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Email
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                First Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Last Name
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Superadmin
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-2 text-slate-700">{user.email ?? "-"}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {user.first_name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {user.last_name ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {user.is_superadmin ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(user.created_datetime_utc)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={5}
                >
                  {error ? "Unable to display users." : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
