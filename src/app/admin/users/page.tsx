import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminPagination } from "../_components/AdminPagination";
import {
  getBooleanParam,
  getLikePattern,
  getStringParam,
  hasAdminFilters,
} from "../_lib/filters";
import { getAdminPagination } from "../_lib/pagination";

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    superadmin?: string;
  }>;
};

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

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireSuperadmin();
  const params = await searchParams;
  const { page, pageSize, from, to } = getAdminPagination(params);
  const searchQuery = getStringParam(params, "q");
  const superadminFilter = getBooleanParam(params, "superadmin");
  const hasFilters = hasAdminFilters(params, ["q", "superadmin"]);
  const supabase = await createClient();

  let usersQuery = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_datetime_utc", {
      count: "exact",
    });

  if (searchQuery) {
    const likePattern = getLikePattern(searchQuery);
    usersQuery = usersQuery.or(
      `email.ilike.${likePattern},first_name.ilike.${likePattern},last_name.ilike.${likePattern}`,
    );
  }

  if (superadminFilter !== null) {
    usersQuery = usersQuery.eq("is_superadmin", superadminFilter);
  }

  const { data: users, error, count } = await usersQuery
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-2 text-sm text-slate-600">Read-only user directory.</p>

      <form className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto_auto]">
        <label className="text-sm text-slate-700">
          <span className="font-medium">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Email, first name, or last name"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-slate-700">
          <span className="font-medium">Superadmin</span>
          <select
            name="superadmin"
            defaultValue={getStringParam(params, "superadmin")}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        >
          Apply
        </button>
        {hasFilters ? (
          <a
            href="/admin/users"
            className="self-end rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            Clear
          </a>
        ) : null}
      </form>

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
                  {error
                    ? "Unable to display users."
                    : hasFilters
                      ? "No users match these filters."
                      : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        basePath="/admin/users"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="users"
      />
    </section>
  );
}
