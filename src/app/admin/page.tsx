import Link from "next/link";
import { Fraunces } from "next/font/google";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { AdminBadge } from "./_components/AdminBadge";
import { ImagePreviewButton } from "./_components/ImagePreviewButton";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

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

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "-";
  }

  return `${Math.round(value)}%`;
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
      className="rounded-[1.5rem] border border-[var(--border)] bg-[color:var(--panel)] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-[#d5b497] hover:bg-[color:var(--panel-strong)] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:focus:ring-offset-slate-950"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
          {detail}
        </p>
      ) : null}
    </Link>
  );
}

function DashboardPanel({
  title,
  description,
  action,
  children,
  collapsible = false,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  if (collapsible) {
    return (
      <details className="group rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-[color:var(--panel)]">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-[1.25rem] border border-transparent pb-4 transition hover:border-[#d5b497] hover:bg-[#fff8ef] hover:px-3 hover:pt-3 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:hover:bg-[var(--panel-muted)]">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-3">
            {action ? <div className="shrink-0">{action}</div> : null}
            <span className="text-sm font-medium text-slate-500 transition-transform group-open:rotate-180 dark:text-slate-300">
              ▼
            </span>
          </div>
        </summary>
        <div className="mt-5">{children}</div>
      </details>
    );
  }

  return (
    <section className="rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-[color:var(--panel)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function HeroMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.25rem] border border-white/12 bg-white/8 px-4 py-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </article>
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
  const topCaptionVotes = mostVotedCaptions[0]?.like_count ?? null;
  const topCaptionText = mostVotedCaptions[0]?.content ?? null;
  const featuredRate =
    captionsCount && captionsCount > 0
      ? ((featuredCaptionsCount ?? 0) / captionsCount) * 100
      : null;
  const requestCoverageRate =
    captionRequestsTodayCount && captionRequestsTodayCount > 0
      ? ((captionsTodayCount ?? 0) / captionRequestsTodayCount) * 100
      : null;
  const queueGap =
    (captionRequestsTodayCount ?? 0) - (captionsTodayCount ?? 0);

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
  const priorityFocus =
    slowestResponseSeconds && slowestResponseSeconds >= 20
      ? {
          label: "Model latency",
          detail: `Recent LLM work peaked at ${slowestResponseSeconds}s. Review response logs before throughput slips further.`,
          actionHref: "/admin/llm-responses",
          actionLabel: "Review responses",
          tone: "warning" as const,
        }
      : queueGap > 0
        ? {
            label: "Request backlog",
            detail: `${formatCount(queueGap)} more requests than captions were created today. Focus the review queue first.`,
            actionHref: "/admin/caption-requests",
            actionLabel: "Open request queue",
            tone: "danger" as const,
          }
        : {
            label: "Editorial quality",
            detail:
              featuredCaptionsCount === 0
                ? "No featured captions are set right now. Choose strong candidates to surface quality."
                : "Core metrics are stable. Shift attention toward editorial quality and featured content selection.",
            actionHref: "/admin/captions",
            actionLabel: "Review captions",
            tone: "accent" as const,
          };
  const quickActions = [
    { href: "/admin/captions", label: "Review captions" },
    { href: "/admin/images", label: "Check images" },
    { href: "/admin/llm-responses", label: "Inspect LLM output" },
  ];
  const attentionItems = [
    slowestResponseSeconds && slowestResponseSeconds >= 20
      ? {
          title: "Slow response times need review",
          detail: `Recent LLM processing reached ${slowestResponseSeconds}s. Inspect response logs before throughput slips further.`,
          tone: "warning" as const,
        }
      : null,
    captionRequestsTodayCount !== null &&
    captionsTodayCount !== null &&
    captionRequestsTodayCount > captionsTodayCount
      ? {
          title: "Caption demand is outpacing output",
          detail: `${formatCount(captionRequestsTodayCount)} requests were created today, versus ${formatCount(captionsTodayCount)} captions.`,
          tone: "danger" as const,
        }
      : null,
    featuredCaptionsCount === 0
      ? {
          title: "No featured captions are set",
          detail: "Editorially strong captions are not currently being highlighted.",
          tone: "accent" as const,
        }
      : null,
  ].filter(Boolean) as { title: string; detail: string; tone: "warning" | "danger" | "accent" }[];
  const recentActivity = [
    ...recentCaptionRequests.map((request) => ({
      id: `request-${request.id}`,
      label: `Request #${request.id} submitted`,
      detail: `${getRelatedValue(request.profiles, "email")} · Image ${request.image_id}`,
      sortKey: request.created_datetime_utc,
      timestamp: formatDate(request.created_datetime_utc),
      tone: "warning" as const,
    })),
    ...recentLlmResponses.map((response) => ({
      id: `response-${response.id}`,
      label: `${getRelatedValue(response.llm_models, "name")} finished request #${response.caption_request_id}`,
      detail: `${response.processing_time_seconds}s · ${getRelatedValue(response.humor_flavors, "slug")}`,
      sortKey: response.created_datetime_utc,
      timestamp: formatDate(response.created_datetime_utc),
      tone: "accent" as const,
    })),
    ...recentUsers.map((recentUser) => ({
      id: `user-${recentUser.id}`,
      label: recentUser.email ?? "New user record created",
      detail: recentUser.id,
      sortKey: recentUser.created_datetime_utc,
      timestamp: formatDate(recentUser.created_datetime_utc),
      tone: "success" as const,
    })),
  ]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,#172033,#22324b)] p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="w-full max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f9c28f]">
              <span className="h-2 w-2 rounded-full bg-[#f2a65a]" />
              Control Room
            </div>
            <h1
              className={`${fraunces.className} mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl`}
            >
              The Humor Control Room
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-slate-200">
              Track captions, images, votes, and user activity from one place so the system stays clean, funny, and demo-ready.
            </p>
          </div>
         </div>

         <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Requests Covered"
            value={formatPercent(requestCoverageRate)}
            detail={
              captionRequestsTodayCount && captionRequestsTodayCount > 0
                ? `${formatCount(captionsTodayCount)} captions for ${formatCount(captionRequestsTodayCount)} requests today`
                : "No request coverage signal yet today"
            }
          />
          <HeroMetric
            label="Featured Rate"
            value={formatPercent(featuredRate)}
            detail={`${formatCount(featuredCaptionsCount)} featured out of ${formatCount(captionsCount)} total captions`}
          />
          <HeroMetric
            label="Top Caption"
            value={topCaptionVotes === null ? "-" : `${topCaptionVotes}`}
            detail={topCaptionText ? "Highest current vote total" : "No caption votes yet"}
          />
          <HeroMetric
            label="Average Response"
            value={
              averageProcessingTime === null
                ? "-"
                : `${averageProcessingTime.toFixed(1)}s`
            }
            detail="Average LLM processing time today"
          />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <AdminBadge tone={priorityFocus.tone}>{priorityFocus.label}</AdminBadge>
                <p className="text-sm text-slate-300">Signed in as {user.email}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {priorityFocus.detail}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={priorityFocus.actionHref}
                prefetch={false}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#172033] transition hover:bg-[#fff1e2]"
              >
                {priorityFocus.actionLabel}
              </Link>
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  prefetch={false}
                  className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/16"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {statsError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some dashboard stats failed to load. Please refresh and try again.
        </p>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              System snapshot
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Core record counts across the operating system.
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

      <details className="group rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-[color:var(--panel)]">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-[1.25rem] border border-transparent pb-4 transition hover:border-[#d5b497] hover:bg-[#fff8ef] hover:px-3 hover:pt-3 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:hover:bg-[var(--panel-muted)]">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              Today’s throughput
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Records created since 00:00 UTC, presented as a live operating flow.
            </p>
          </div>
          <span className="mt-1 text-sm font-medium text-slate-500 transition-transform group-open:rotate-180 dark:text-slate-300">
            ▼
          </span>
        </summary>
        <div className="mt-5 -mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex min-w-max gap-3">
            {[
              {
                href: "/admin/users",
                label: "Users",
                value: formatCount(usersTodayCount),
                detail: "new profiles",
              },
              {
                href: "/admin/images",
                label: "Images",
                value: formatCount(imagesTodayCount),
                detail: "new assets",
              },
              {
                href: "/admin/caption-requests",
                label: "Requests",
                value: formatCount(captionRequestsTodayCount),
                detail: "creative demand",
              },
              {
                href: "/admin/captions",
                label: "Captions",
                value: formatCount(captionsTodayCount),
                detail: "editorial output",
              },
              {
                href: "/admin/llm-responses",
                label: "Responses",
                value: formatCount(llmResponsesTodayCount),
                detail: "model completions",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="min-w-[11rem] rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4 transition hover:border-[#d5b497] hover:bg-[#fff8ef]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold leading-none tracking-[-0.03em] text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
                  {item.detail}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </details>

      <DashboardPanel
        title="Publishing health"
        description="Signals that tell you whether the system is balanced, featured, and ready to publish."
        collapsible
      >
        <div className="grid gap-3">
          <article className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Request backlog
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
                  {queueGap > 0 ? formatCount(queueGap) : "0"}
                </p>
              </div>
              <AdminBadge tone={queueGap > 0 ? "danger" : "success"}>
                {queueGap > 0 ? "Needs review" : "Balanced"}
              </AdminBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {queueGap > 0
                ? `${formatCount(queueGap)} more requests than captions were created today.`
                : "Caption output is keeping pace with incoming requests today."}
            </p>
          </article>

          <article className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Featured caption coverage
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
                  {formatPercent(featuredRate)}
                </p>
              </div>
              <AdminBadge tone={(featuredRate ?? 0) > 0 ? "accent" : "warning"}>
                {(featuredRate ?? 0) > 0 ? "Editorial" : "Missing"}
              </AdminBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {(featuredRate ?? 0) > 0
                ? `${formatCount(featuredCaptionsCount)} captions are currently featured.`
                : "No captions are currently featured. Surface quality winners to guide editorial standards."}
            </p>
          </article>

          {attentionItems.length > 0 ? (
            attentionItems.slice(0, 1).map((item) => (
              <article
                key={item.title}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.detail}
                    </p>
                  </div>
                  <AdminBadge tone={item.tone}>
                    {item.tone === "danger"
                      ? "High"
                      : item.tone === "warning"
                        ? "Review"
                        : "Editorial"}
                  </AdminBadge>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              No urgent operational issues are surfaced from the current snapshot.
            </div>
          )}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="LLM performance"
        description="Response timing and recent outliers based on today’s records."
        action={
          <Link
            href="/admin/llm-responses"
            prefetch={false}
            className="rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#d5b497] hover:bg-[#fff8ef] dark:text-slate-100 dark:hover:bg-[var(--panel-muted)]"
          >
            View responses
          </Link>
        }
        collapsible
      >

        {llmError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load LLM performance right now.
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Responses Today
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              {formatCount(llmResponsesTodayCount)}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Average Time Today
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              {averageProcessingTime === null
                ? "-"
                : `${averageProcessingTime.toFixed(1)}s`}
            </p>
          </article>
          <article className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Slowest Recent
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
              {slowestResponseSeconds === null ? "-" : `${slowestResponseSeconds}s`}
            </p>
          </article>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[color:var(--panel-strong)]">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-[#f4ede3] dark:bg-[var(--panel-muted)]">
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
                  <tr key={response.id} className="transition hover:bg-[#fff8ef] dark:hover:bg-[var(--panel-muted)]">
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
      </DashboardPanel>

      <DashboardPanel
        title="Most voted captions"
        description="Top-performing captions ranked by current like count."
        action={
          <Link
            href="/admin/captions"
            prefetch={false}
            className="rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#d5b497] hover:bg-[#fff8ef] dark:text-slate-100 dark:hover:bg-[var(--panel-muted)]"
          >
            View captions
          </Link>
        }
        collapsible
      >

        {mostVotedCaptionsError ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load most voted captions right now.
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {mostVotedCaptions.length > 0 ? (
            mostVotedCaptions.map((caption) => {
              const imageUrl = getRelatedValue(caption.images, "url");

              return (
                <article
                  key={caption.id}
                  className="flex gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4"
                >
                  <div className="shrink-0">
                    {imageUrl !== "-" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Caption image thumbnail"
                        className="h-24 w-24 rounded-[1.25rem] border border-[var(--border)] object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-muted)] text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone="accent">{caption.like_count} votes</AdminBadge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(caption.created_datetime_utc)}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-800 dark:text-slate-100">
                      {caption.content ?? "-"}
                    </p>
                    <p className="mt-3 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                      {caption.id}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                      {caption.profile_id}
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-6 text-center text-slate-500 dark:text-slate-300 xl:col-span-2">
              No voted captions found.
            </p>
          )}
        </div>
      </DashboardPanel>

      {recentActivityError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Some recent activity failed to load. Please refresh and try again.
        </p>
      ) : null}

      <DashboardPanel
        title="Recent activity"
        description="A cross-section of requests, responses, and account events worth scanning first."
        collapsible
      >
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone={item.tone}>
                        {item.tone === "success"
                          ? "User"
                          : item.tone === "warning"
                            ? "Request"
                            : "Model"}
                      </AdminBadge>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.label}
                      </p>
                    </div>
                    <p className="mt-2 truncate text-sm text-slate-600 dark:text-slate-300">
                      {item.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {item.timestamp}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-6 text-center text-slate-500 dark:text-slate-300">
              No recent activity found.
            </p>
          )}
        </div>
      </DashboardPanel>

      
        <DashboardPanel
          title="Latest images"
          description="Visual content entering the system most recently."
          collapsible
        >
          <div className="divide-y divide-slate-200">
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
                  <div className="h-12 w-12 shrink-0 rounded-xl border border-[var(--border)] bg-[color:var(--panel-muted)]" />
                )}
                <div className="min-w-0 text-sm">
                  <p className="truncate text-slate-700 dark:text-slate-200">
                    {image.image_description ?? image.url ?? "-"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {image.is_public ? "Public" : "Private"} ·{" "}
                    {formatDate(image.created_datetime_utc)}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                    {image.id}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-300">
              No recent images found.
            </p>
          )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Latest users"
          description="Newest accounts entering the admin ecosystem."
          collapsible
        >
          <div className="divide-y divide-slate-200">
            {recentUsers.length > 0 ? (
              recentUsers.map((recentUser) => (
                <div
                  key={recentUser.id}
                  className="grid gap-1 py-3 text-sm text-slate-700 dark:text-slate-200"
                >
                  <p>{recentUser.email ?? "-"}</p>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {recentUser.id}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(recentUser.created_datetime_utc)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-300">
                No recent users found.
              </p>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Latest caption requests"
          description="Incoming creative demand entering the review queue."
          collapsible
        >
          <div className="divide-y divide-slate-200">
        {recentCaptionRequests.length > 0 ? (
          recentCaptionRequests.map((request) => (
            <div
              key={request.id}
              className="grid gap-1 py-3 text-sm text-slate-700 dark:text-slate-200"
            >
              <p>
                Request #{request.id} ·{" "}
                {getRelatedValue(request.profiles, "email")}
              </p>
              <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                Image {request.image_id}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(request.created_datetime_utc)}
              </p>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-300">
            No recent caption requests found.
          </p>
        )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Latest LLM responses"
          description="Recent generated output with timing, flavor, and request context."
          collapsible
        >
          <div className="divide-y divide-slate-200">
          {recentLlmResponses.length > 0 ? (
            recentLlmResponses.map((response) => (
              <div
                key={response.id}
                className="grid gap-1 py-3 text-sm text-slate-700 dark:text-slate-200"
              >
                <p>
                  {getRelatedValue(response.llm_models, "name")} ·{" "}
                  {response.processing_time_seconds}s · Request #
                  {response.caption_request_id}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getRelatedValue(response.profiles, "email")} ·{" "}
                  {getRelatedValue(response.humor_flavors, "slug")} ·{" "}
                  {formatDate(response.created_datetime_utc)}
                </p>
                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                  {response.llm_model_response ?? "-"}
                </p>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-300">
              No recent LLM responses found.
            </p>
          )}
          </div>
        </DashboardPanel>
      
    </div>
  );
}
