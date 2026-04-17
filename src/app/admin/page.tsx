import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { ImagePreviewButton } from "./_components/ImagePreviewButton";

type RelatedImage =
  | { url: string | null }
  | { url: string | null }[]
  | null;

type RelatedProfile =
  | { email: string | null }
  | { email: string | null }[]
  | null;

type RelatedLlmModel =
  | { name: string | null }
  | { name: string | null }[]
  | null;

type RelatedFlavor =
  | { slug: string | null }
  | { slug: string | null }[]
  | null;

type RecentUser = {
  id: string;
  email: string | null;
  created_datetime_utc: string;
};

type RecentImage = {
  id: string;
  url: string | null;
  image_description: string | null;
  is_public: boolean | null;
  created_datetime_utc: string;
};

type RecentCaptionRequest = {
  id: number;
  profile_id: string;
  image_id: string;
  created_datetime_utc: string;
  profiles: RelatedProfile;
  images: RelatedImage;
};

type RecentLlmResponse = {
  id: string;
  created_datetime_utc: string;
  processing_time_seconds: number;
  caption_request_id: number;
  llm_model_response: string | null;
  llm_models: RelatedLlmModel;
  profiles: RelatedProfile;
  humor_flavors: RelatedFlavor;
};

type SlowLlmResponse = {
  id: string;
  created_datetime_utc: string;
  processing_time_seconds: number;
  caption_request_id: number;
  llm_models: RelatedLlmModel;
};

type MostVotedCaption = {
  id: string;
  content: string | null;
  like_count: number;
  profile_id: string;
  image_id: string;
  created_datetime_utc: string;
  images: RelatedImage;
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

function getRelatedValue<T extends string>(
  relatedRecord: Record<T, string | null> | Record<T, string | null>[] | null,
  key: T,
) {
  if (!relatedRecord) {
    return "-";
  }

  if (Array.isArray(relatedRecord)) {
    return relatedRecord[0]?.[key] ?? "-";
  }

  return relatedRecord[key] ?? "-";
}

function formatCount(value: number | null) {
  return (value ?? 0).toLocaleString("en-US");
}

function getTodayStartUtc() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
}

function getAverageProcessingTime(responses: { processing_time_seconds: number }[]) {
  if (responses.length === 0) {
    return null;
  }

  const total = responses.reduce(
    (sum, response) => sum + response.processing_time_seconds,
    0,
  );

  return total / responses.length;
}

function MetricCard({
  href,
  label,
  value,
  detail,
}: {
  href: string;
  label: string;
  value: number | string;
  detail?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="rounded-xl border border-purple-100 bg-white p-5 shadow-md shadow-purple-950/5 transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-950/10 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 dark:hover:border-purple-500/60 dark:hover:shadow-black/30 dark:focus:ring-offset-slate-950"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const { user } = await requireSuperadmin();
  const supabase = await createClient();
  const todayStartUtc = getTodayStartUtc();

  const [
    { count: usersCount, error: usersCountError },
    { count: imagesCount, error: imagesCountError },
    { count: captionsCount, error: captionsCountError },
    { count: captionRequestsCount, error: captionRequestsCountError },
    { count: llmResponsesCount, error: llmResponsesCountError },
    { count: featuredCaptionsCount, error: featuredCountError },
    { count: usersTodayCount, error: usersTodayError },
    { count: imagesTodayCount, error: imagesTodayError },
    { count: captionsTodayCount, error: captionsTodayError },
    { count: captionRequestsTodayCount, error: captionRequestsTodayError },
    { count: llmResponsesTodayCount, error: llmResponsesTodayError },
    { data: recentUsersData, error: recentUsersError },
    { data: recentImagesData, error: recentImagesError },
    { data: recentCaptionRequestsData, error: recentCaptionRequestsError },
    { data: recentLlmResponsesData, error: recentLlmResponsesError },
    { data: slowLlmResponsesData, error: slowLlmResponsesError },
    { data: llmPerformanceData, error: llmPerformanceError },
    { data: mostVotedCaptionsData, error: mostVotedCaptionsError },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("caption_requests").select("*", { count: "exact", head: true }),
    supabase.from("llm_model_responses").select("*", {
      count: "exact",
      head: true,
    }),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", todayStartUtc),
    supabase
      .from("images")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", todayStartUtc),
    supabase
      .from("captions")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", todayStartUtc),
    supabase
      .from("caption_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", todayStartUtc),
    supabase
      .from("llm_model_responses")
      .select("*", { count: "exact", head: true })
      .gte("created_datetime_utc", todayStartUtc),
    supabase
      .from("profiles")
      .select("id, email, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("images")
      .select("id, url, image_description, is_public, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("caption_requests")
      .select(
        "id, created_datetime_utc, profile_id, image_id, profiles!caption_requests_profile_id_fkey(email), images(url)",
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("llm_model_responses")
      .select(
        "id, created_datetime_utc, processing_time_seconds, caption_request_id, llm_model_response, llm_models(name), profiles!llm_model_responses_profile_id_fkey(email), humor_flavors(slug)",
      )
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("llm_model_responses")
      .select(
        "id, created_datetime_utc, processing_time_seconds, caption_request_id, llm_models(name)",
      )
      .order("processing_time_seconds", { ascending: false })
      .limit(5),
    supabase
      .from("llm_model_responses")
      .select("processing_time_seconds, created_datetime_utc")
      .gte("created_datetime_utc", todayStartUtc)
      .order("created_datetime_utc", { ascending: false })
      .limit(200),
    supabase
      .from("captions")
      .select(
        "id, content, like_count, profile_id, image_id, created_datetime_utc, images(url)",
      )
      .order("like_count", { ascending: false })
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
  ]);

  const recentUsers = (recentUsersData ?? []) as RecentUser[];
  const recentImages = (recentImagesData ?? []) as RecentImage[];
  const recentCaptionRequests =
    (recentCaptionRequestsData ?? []) as RecentCaptionRequest[];
  const recentLlmResponses = (recentLlmResponsesData ?? []) as RecentLlmResponse[];
  const slowLlmResponses = (slowLlmResponsesData ?? []) as SlowLlmResponse[];
  const llmPerformanceRows =
    (llmPerformanceData ?? []) as { processing_time_seconds: number }[];
  const mostVotedCaptions =
    (mostVotedCaptionsData ?? []) as MostVotedCaption[];
  const averageProcessingTime = getAverageProcessingTime(llmPerformanceRows);
  const slowestResponseSeconds = slowLlmResponses[0]?.processing_time_seconds ?? null;

  const statsError =
    usersCountError ||
    imagesCountError ||
    captionsCountError ||
    captionRequestsCountError ||
    llmResponsesCountError ||
    featuredCountError ||
    usersTodayError ||
    imagesTodayError ||
    captionsTodayError ||
    captionRequestsTodayError ||
    llmResponsesTodayError;

  const recentActivityError =
    recentUsersError ||
    recentImagesError ||
    recentCaptionRequestsError ||
    recentLlmResponsesError;

  const llmError = slowLlmResponsesError || llmPerformanceError;

  return (
    <div className="space-y-6">
      <section className="w-full rounded-xl border border-purple-100 bg-white p-8 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-3 text-sm text-slate-600">
          Signed in as <span className="font-medium">{user.email}</span>.
        </p>
      </section>

      {statsError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some dashboard stats failed to load. Please refresh and try again.
        </p>
      ) : null}

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              System Snapshot
            </h2>
            <p className="text-sm text-slate-600">
              All-time counts for core admin records.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            href="/admin/users"
            label="Users"
            value={formatCount(usersCount)}
            detail="Total profiles"
          />
          <MetricCard
            href="/admin/images"
            label="Images"
            value={formatCount(imagesCount)}
            detail="Total image records"
          />
          <MetricCard
            href="/admin/captions"
            label="Captions"
            value={formatCount(captionsCount)}
            detail={`${formatCount(featuredCaptionsCount)} featured`}
          />
          <MetricCard
            href="/admin/caption-requests"
            label="Requests"
            value={formatCount(captionRequestsCount)}
            detail="Caption requests"
          />
          <MetricCard
            href="/admin/llm-responses"
            label="LLM Responses"
            value={formatCount(llmResponsesCount)}
            detail="Generated outputs"
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Today UTC</h2>
          <p className="text-sm text-slate-600">
            New records created since 00:00 UTC.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            href="/admin/users"
            label="New Users"
            value={formatCount(usersTodayCount)}
          />
          <MetricCard
            href="/admin/images"
            label="New Images"
            value={formatCount(imagesTodayCount)}
          />
          <MetricCard
            href="/admin/captions"
            label="New Captions"
            value={formatCount(captionsTodayCount)}
          />
          <MetricCard
            href="/admin/caption-requests"
            label="New Requests"
            value={formatCount(captionRequestsTodayCount)}
          />
          <MetricCard
            href="/admin/llm-responses"
            label="LLM Responses"
            value={formatCount(llmResponsesTodayCount)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              LLM Performance
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Response timing based on records created today.
            </p>
          </div>
          <Link
            href="/admin/llm-responses"
            prefetch={false}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View responses
          </Link>
        </div>

        {llmError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load LLM performance right now.
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-purple-100 bg-purple-50/40 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Responses Today
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatCount(llmResponsesTodayCount)}
            </p>
          </article>
          <article className="rounded-lg border border-purple-100 bg-purple-50/40 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Average Time Today
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {averageProcessingTime === null
                ? "-"
                : `${averageProcessingTime.toFixed(1)}s`}
            </p>
          </article>
          <article className="rounded-lg border border-purple-100 bg-purple-50/40 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Slowest Recent
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {slowestResponseSeconds === null ? "-" : `${slowestResponseSeconds}s`}
            </p>
          </article>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Time
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Model
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Caption Request
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Created UTC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {slowLlmResponses.length > 0 ? (
                slowLlmResponses.map((response) => (
                  <tr key={response.id}>
                    <td className="px-3 py-2 text-slate-700">
                      {response.processing_time_seconds}s
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {getRelatedValue(response.llm_models, "name")}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {response.caption_request_id}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(response.created_datetime_utc)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={4}
                  >
                    No LLM response timing data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Most Voted Captions
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Captions ranked by current like count.
            </p>
          </div>
          <Link
            href="/admin/captions"
            prefetch={false}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View captions
          </Link>
        </div>

        {mostVotedCaptionsError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load most voted captions right now.
          </p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/20">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Thumbnail
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Caption
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Votes
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Profile ID
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">
                  Created UTC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {mostVotedCaptions.length > 0 ? (
                mostVotedCaptions.map((caption) => {
                  const imageUrl = getRelatedValue(caption.images, "url");

                  return (
                    <tr key={caption.id}>
                      <td className="px-3 py-2">
                        {imageUrl !== "-" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt="Caption image thumbnail"
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="max-w-xl px-3 py-2 text-slate-700">
                        <p className="line-clamp-2">{caption.content ?? "-"}</p>
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {caption.id}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {caption.like_count}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">
                        {caption.profile_id}
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
                    colSpan={5}
                  >
                    No voted captions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {recentActivityError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some recent activity failed to load. Please refresh and try again.
        </p>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-900">Latest Users</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((recentUser) => (
                <div
                  key={recentUser.id}
                  className="grid gap-1 py-3 text-sm text-slate-700"
                >
                  <p>{recentUser.email ?? "-"}</p>
                  <p className="font-mono text-xs text-slate-500">
                    {recentUser.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(recentUser.created_datetime_utc)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                No recent users found.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-900">Latest Images</h2>
          <p className="mt-1 text-sm font-medium text-purple-700">
            Click an image to view it larger.
          </p>
          <div className="mt-4 divide-y divide-slate-200">
            {recentImages.length > 0 ? (
              recentImages.map((image) => (
                <div key={image.id} className="flex gap-3 py-3">
                  {image.url ? (
                    <ImagePreviewButton
                      imageUrl={image.url}
                      thumbnailAlt="Recent image thumbnail"
                      previewAlt="Recent image preview"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded bg-slate-100" />
                  )}
                  <div className="min-w-0 text-sm">
                    <p className="truncate text-slate-700">
                      {image.image_description ?? image.url ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {image.is_public ? "Public" : "Private"} ·{" "}
                      {formatDate(image.created_datetime_utc)}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500">
                      {image.id}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                No recent images found.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-900">
            Latest Caption Requests
          </h2>
          <div className="mt-4 divide-y divide-slate-200">
            {recentCaptionRequests.length > 0 ? (
              recentCaptionRequests.map((request) => (
                <div
                  key={request.id}
                  className="grid gap-1 py-3 text-sm text-slate-700"
                >
                  <p>
                    Request #{request.id} ·{" "}
                    {getRelatedValue(request.profiles, "email")}
                  </p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    Image {request.image_id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(request.created_datetime_utc)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                No recent caption requests found.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-purple-100 bg-white p-6 shadow-md shadow-purple-950/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <h2 className="text-lg font-semibold text-slate-900">
            Latest LLM Responses
          </h2>
          <div className="mt-4 divide-y divide-slate-200">
            {recentLlmResponses.length > 0 ? (
              recentLlmResponses.map((response) => (
                <div
                  key={response.id}
                  className="grid gap-1 py-3 text-sm text-slate-700"
                >
                  <p>
                    {getRelatedValue(response.llm_models, "name")} ·{" "}
                    {response.processing_time_seconds}s · Request #
                    {response.caption_request_id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getRelatedValue(response.profiles, "email")} ·{" "}
                    {getRelatedValue(response.humor_flavors, "slug")} ·{" "}
                    {formatDate(response.created_datetime_utc)}
                  </p>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {response.llm_model_response ?? "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                No recent LLM responses found.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
