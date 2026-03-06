import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

type TopImageRow = {
  imageId: string;
  imageUrl: string | null;
  captionCount: number;
};

type TopCaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  profile_id: string;
  image_id: string;
  imageUrl: string | null;
};

type TopUserRow = {
  profileId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  captionCount: number;
};

function toImageUrl(
  relatedImage: { url: string | null } | { url: string | null }[] | null,
) {
  if (!relatedImage) {
    return null;
  }

  if (Array.isArray(relatedImage)) {
    return relatedImage[0]?.url ?? null;
  }

  return relatedImage.url;
}

function toProfile(
  relatedProfile:
    | { email: string | null; first_name: string | null; last_name: string | null }
    | {
        email: string | null;
        first_name: string | null;
        last_name: string | null;
      }[]
    | null,
) {
  if (!relatedProfile) {
    return { email: null, first_name: null, last_name: null };
  }

  if (Array.isArray(relatedProfile)) {
    return (
      relatedProfile[0] ?? { email: null, first_name: null, last_name: null }
    );
  }

  return relatedProfile;
}

export default async function AdminDashboardPage() {
  const { user } = await requireSuperadmin();
  const supabase = await createClient();

  const [
    { count: usersCount, error: usersCountError },
    { count: imagesCount, error: imagesCountError },
    { count: captionsCount, error: captionsCountError },
    { count: featuredCaptionsCount, error: featuredCountError },
    { data: topCaptionsData, error: topCaptionsError },
    { data: imageCaptionRows, error: topImagesError },
    { data: userCaptionRows, error: topUsersError },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("captions")
      .select("id, content, like_count, profile_id, image_id, images(url)")
      .order("like_count", { ascending: false })
      .limit(10),
    supabase.from("captions").select("image_id, images(url)"),
    supabase
      .from("captions")
      .select("profile_id, profiles(email, first_name, last_name)"),
  ]);

  const topCaptions: TopCaptionRow[] = (topCaptionsData ?? []).map(
    (row: {
      id: string;
      content: string | null;
      like_count: number;
      profile_id: string;
      image_id: string;
      images: { url: string | null } | { url: string | null }[] | null;
    }) => ({
      id: row.id,
      content: row.content,
      like_count: row.like_count,
      profile_id: row.profile_id,
      image_id: row.image_id,
      imageUrl: toImageUrl(row.images),
    }),
  );

  const topImagesMap = new Map<string, TopImageRow>();
  for (const row of imageCaptionRows ?? []) {
    const imageId = row.image_id as string;
    const imageUrl = toImageUrl(
      row.images as { url: string | null } | { url: string | null }[] | null,
    );

    const existing = topImagesMap.get(imageId);
    if (existing) {
      existing.captionCount += 1;
    } else {
      topImagesMap.set(imageId, {
        imageId,
        imageUrl,
        captionCount: 1,
      });
    }
  }

  const topImages = Array.from(topImagesMap.values())
    .sort((a, b) => b.captionCount - a.captionCount)
    .slice(0, 10);

  const topUsersMap = new Map<string, TopUserRow>();
  for (const row of userCaptionRows ?? []) {
    const profileId = row.profile_id as string;
    const profile = toProfile(
      row.profiles as
        | {
            email: string | null;
            first_name: string | null;
            last_name: string | null;
          }
        | {
            email: string | null;
            first_name: string | null;
            last_name: string | null;
          }[]
        | null,
    );

    const existing = topUsersMap.get(profileId);
    if (existing) {
      existing.captionCount += 1;
    } else {
      topUsersMap.set(profileId, {
        profileId,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        captionCount: 1,
      });
    }
  }

  const topUsers = Array.from(topUsersMap.values())
    .sort((a, b) => b.captionCount - a.captionCount)
    .slice(0, 10);

  const statsError =
    usersCountError || imagesCountError || captionsCountError || featuredCountError;

  return (
    <div className="space-y-6">
      <section className="w-full rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-sm text-slate-600">
          Signed in as <span className="font-medium">{user.email}</span>.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total users
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {usersCount ?? 0}
          </p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total images
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {imagesCount ?? 0}
          </p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total captions
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {captionsCount ?? 0}
          </p>
        </article>
        <article className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Featured captions
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {featuredCaptionsCount ?? 0}
          </p>
        </article>
      </section>

      {statsError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some dashboard stats failed to load. Please refresh and try again.
        </p>
      ) : null}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Top Images By Caption Count
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Thumbnail
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Image ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  URL
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Captions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topImages.length > 0 ? (
                topImages.map((row) => (
                  <tr key={row.imageId}>
                    <td className="px-3 py-2">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt="Top image thumbnail"
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {row.imageId}
                    </td>
                    <td className="max-w-xs truncate px-3 py-2 text-slate-600">
                      {row.imageUrl ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.captionCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td
                      className="px-3 py-6 text-center text-slate-500"
                      colSpan={4}
                    >
                      {topImagesError
                        ? "Unable to load top images."
                      : "No image caption activity yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Top Captions By Like Count
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Thumbnail
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Content
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Like Count
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Profile ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Image ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topCaptions.length > 0 ? (
                topCaptions.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt="Caption image thumbnail"
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="max-w-xl px-3 py-2 text-slate-700">
                      {row.content ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.like_count}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {row.profile_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {row.image_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td
                      className="px-3 py-6 text-center text-slate-500"
                      colSpan={5}
                    >
                      {topCaptionsError
                        ? "Unable to load top captions."
                      : "No captions found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Top Users By Caption Count
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Profile ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Captions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topUsers.length > 0 ? (
                topUsers.map((row) => (
                  <tr key={row.profileId}>
                    <td className="px-3 py-2 text-slate-700">
                      {row.email ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {[row.firstName, row.lastName].filter(Boolean).join(" ") ||
                        "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {row.profileId}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.captionCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={4}
                  >
                    {topUsersError
                      ? "Unable to load active users."
                      : "No user caption activity yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
