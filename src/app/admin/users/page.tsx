import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "../_components/AdminBadge";
import { AdminInspector } from "../_components/AdminInspector";
import { AdminListShell } from "../_components/AdminListShell";
import { AdminPagination } from "../_components/AdminPagination";
import { AdminViewToggle } from "../_components/AdminViewToggle";
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
    view?: string;
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
  const view = getStringParam(params, "view") === "table" ? "table" : "preview";
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
    <AdminListShell
      title="Users"
      description="Review accounts in a roster-style layout, then switch to the dense table when you need raw comparison."
      toolbar={
        <AdminViewToggle
          basePath="/admin/users"
          searchParams={params}
          currentView={view}
          options={[
            { key: "preview", label: "Preview" },
            { key: "table", label: "Table" },
          ]}
        />
      }
    >
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">User roster</p>
            <p className="mt-1 text-sm text-slate-600">
              Preview emphasizes account identity and admin state before raw IDs and timestamps.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="accent">Default view: Preview</AdminBadge>
            <AdminBadge tone="neutral">Dense fallback: Table</AdminBadge>
          </div>
        </div>

        <form className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto_auto]">
          <input type="hidden" name="view" value={view} />
          <label className="text-sm text-slate-700">
            <span className="font-medium">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Email, first name, or last name"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-slate-700">
            <span className="font-medium">Superadmin</span>
            <select
              name="superadmin"
              defaultValue={getStringParam(params, "superadmin")}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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
            <Link
              href={view === "table" ? "/admin/users?view=table" : "/admin/users"}
              className="self-end rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load users right now.
        </p>
      ) : null}

      {view === "table" ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
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
            <tbody className="divide-y divide-slate-200 bg-white dark:bg-slate-900">
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
      ) : users && users.length > 0 ? (
        <div className="mt-5 space-y-4">
          {users.map((user) => {
            const fullName = [user.first_name, user.last_name]
              .filter(Boolean)
              .join(" ");

            return (
              <article
                key={user.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
                  <div className="min-w-0">
                    <p className="text-base font-semibold leading-6 text-slate-900">
                      {fullName || "Unnamed user"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {user.email ?? "-"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Created {formatDate(user.created_datetime_utc)}
                    </p>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        User ID
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-700">
                        {user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2 lg:w-52 lg:justify-end">
                    <AdminBadge tone={user.is_superadmin ? "warning" : "neutral"}>
                      {user.is_superadmin ? "Superadmin" : "Standard user"}
                    </AdminBadge>
                    {user.first_name ? (
                      <AdminBadge tone="accent">First: {user.first_name}</AdminBadge>
                    ) : null}
                    {user.last_name ? (
                      <AdminBadge tone="neutral">Last: {user.last_name}</AdminBadge>
                    ) : null}
                    <AdminInspector
                      summary="Open details"
                      closedLabel="Open details"
                      openLabel="Close details"
                      className="w-full lg:text-right"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Profile
                          </p>
                          <div className="mt-2 space-y-2 text-sm text-slate-700">
                            <p>Email: {user.email ?? "-"}</p>
                            <p>First name: {user.first_name ?? "-"}</p>
                            <p>Last name: {user.last_name ?? "-"}</p>
                            <p>Status: {user.is_superadmin ? "Superadmin" : "Standard user"}</p>
                            <p>Created: {formatDate(user.created_datetime_utc)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            User ID
                          </p>
                          <p className="mt-2 break-all font-mono text-xs text-slate-700">
                            {user.id}
                          </p>
                        </div>
                      </div>
                    </AdminInspector>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          {error
            ? "Unable to display users."
            : hasFilters
              ? "No users match these filters."
              : "No users found."}
        </div>
      )}
      <AdminPagination
        basePath="/admin/users"
        searchParams={params}
        page={page}
        pageSize={pageSize}
        totalCount={count ?? 0}
        itemLabel="users"
      />
    </AdminListShell>
  );
}
