import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

type CaptionWithImage = {
  id: string;
  content: string | null;
  profile_id: string;
  image_id: string;
  like_count: number;
  is_public: boolean;
  is_featured: boolean;
  created_datetime_utc: string;
  images: { url: string | null } | { url: string | null }[] | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

function getImageUrl(
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

export default async function AdminCaptionsPage() {
  await requireSuperadmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("captions")
    .select(
      "id, content, profile_id, image_id, like_count, is_public, is_featured, created_datetime_utc, images(url)",
    )
    .order("created_datetime_utc", { ascending: false });

  const captions: CaptionWithImage[] = (data ?? []).map((row) => ({
    id: row.id as string,
    content: row.content as string | null,
    profile_id: row.profile_id as string,
    image_id: row.image_id as string,
    like_count: row.like_count as number,
    is_public: row.is_public as boolean,
    is_featured: row.is_featured as boolean,
    created_datetime_utc: row.created_datetime_utc as string,
    images: row.images as
      | { url: string | null }
      | { url: string | null }[]
      | null,
  }));

  return (
    <section className="w-full rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Captions</h1>
      <p className="mt-2 text-sm text-slate-600">Read-only captions list.</p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load captions right now.
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto">
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
                Profile ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Image ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Likes
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Public
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Featured
              </th>
              <th className="px-3 py-2 text-left font-medium text-slate-700">
                Created (UTC)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {captions.length > 0 ? (
              captions.map((caption) => {
                const imageUrl = getImageUrl(caption.images);

                return (
                  <tr key={caption.id}>
                    <td className="px-3 py-2">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt="Caption image"
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="max-w-lg px-3 py-2 text-slate-700">
                      {caption.content ?? "-"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {caption.profile_id}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700">
                      {caption.image_id}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {caption.like_count}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {caption.is_public ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {caption.is_featured ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(caption.created_datetime_utc)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-3 py-6 text-center text-slate-500"
                  colSpan={8}
                >
                  {error ? "Unable to display captions." : "No captions found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
