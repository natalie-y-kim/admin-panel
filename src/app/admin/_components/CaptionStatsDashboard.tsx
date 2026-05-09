import type {
  CaptionRatingDashboardStats,
  HumorFlavorRatingStats,
} from "@/lib/captionStats";

type CaptionStatsDashboardProps = {
  stats: CaptionRatingDashboardStats;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const MIN_VOTES_FOR_CAPTION_RANKING = 5;
const MIN_CONFIDENT_FLAVOR_VOTES = 5;

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatScore(value: number | null): string {
  return value === null ? "Needs feedback" : value.toFixed(2);
}

function getFeedbackStatus(row: HumorFlavorRatingStats): string {
  if (row.ratingCount === 0) {
    return "Needs feedback";
  }

  if (row.ratingCount < MIN_CONFIDENT_FLAVOR_VOTES) {
    return "Low confidence";
  }

  return `Avg vote score: ${formatScore(row.averageRating)}`;
}

function getPercent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4">
      <dt className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </dd>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
        {note}
      </p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[color:var(--panel-muted)]">
      <div
        className="h-full rounded-full bg-[#c96f3c] dark:bg-[#f2a65a]"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SetupHealth({ stats }: { stats: CaptionRatingDashboardStats }) {
  return (
    <DashboardPanel
      title="Prompt Chain Setup Health"
      description="Checks whether the prompt-chain configuration is complete enough to interpret caption output."
    >
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg Steps Per Flavor"
          value={stats.setup.averageStepsPerFlavor.toFixed(1)}
          note="Configured workflow steps divided by humor flavors."
        />
        <StatCard
          label="Flavors With Zero Steps"
          value={formatNumber(stats.setup.flavorsWithZeroSteps)}
          note="These flavors may not produce complete prompt-chain output."
        />
        <StatCard
          label="High-Output, Needs Feedback"
          value={formatNumber(stats.setup.highOutputFlavorsWithoutVotes)}
          note="Flavors with at least 10 loaded captions and no votes."
        />
        <StatCard
          label="Unassigned Captions"
          value={formatNumber(stats.setup.captionsMissingFlavor)}
          note="Loaded captions not connected to a humor flavor."
        />
      </dl>
    </DashboardPanel>
  );
}

function CaptionGenerationByFlavor({ rows }: { rows: HumorFlavorRatingStats[] }) {
  const topRows = rows.filter((row) => row.captionCount > 0).slice(0, 10);
  const maxCaptions = Math.max(...topRows.map((row) => row.captionCount), 0);

  return (
    <DashboardPanel
      title="Caption Generation by Humor Flavor"
      description="Top loaded flavors by generated caption count, with feedback shown only where votes exist."
    >
      {topRows.length === 0 ? (
        <p className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4 text-sm text-slate-500 dark:text-slate-300">
          No generated captions are available in the loaded dashboard data yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-[var(--border)]">
          <table className="min-w-full divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[color:var(--panel-muted)] text-[11px] uppercase text-slate-500 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Humor Flavor</th>
                <th className="px-4 py-3 text-left font-semibold">Visible Captions</th>
                <th className="px-4 py-3 text-right font-semibold">Voted Captions</th>
                <th className="px-4 py-3 text-right font-semibold">Total Votes</th>
                <th className="px-4 py-3 text-right font-semibold">Feedback Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[color:var(--panel)]">
              {topRows.map((row) => {
                const width =
                  maxCaptions === 0 ? 0 : (row.captionCount / maxCaptions) * 100;

                return (
                  <tr key={row.flavorId ?? "unassigned"}>
                    <td className="max-w-60 px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <p className="truncate">{row.label}</p>
                    </td>
                    <td className="min-w-56 px-4 py-3">
                      <div className="grid gap-2">
                        <ProgressBar value={width} />
                        <span className="text-xs text-slate-500 dark:text-slate-300">
                          {formatNumber(row.captionCount)} captions
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                      {formatNumber(row.ratedCaptionCount)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                      {formatNumber(row.ratingCount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                      {getFeedbackStatus(row)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}

function FeedbackTrends({ stats }: { stats: CaptionRatingDashboardStats }) {
  const maxRecentRatings = Math.max(
    ...stats.recentRatings.map((bucket) => bucket.ratingCount),
    0,
  );
  const maxVoteDistribution = Math.max(
    ...stats.voteDistribution.map((bucket) => bucket.count),
    0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardPanel
        title="Recent Rating Activity"
        description="Caption vote volume across the last 14 UTC days."
      >
        <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-3 sm:grid-cols-[repeat(14,minmax(0,1fr))]">
          {stats.recentRatings.map((bucket) => (
            <div key={bucket.dateLabel} className="grid gap-2">
              <div className="flex h-28 items-end rounded-full bg-[color:var(--panel-muted)] px-1.5 py-1.5">
                <div
                  className="w-full rounded-full bg-[#172033] dark:bg-[#f2a65a]"
                  style={{
                    height:
                      maxRecentRatings === 0
                        ? "4px"
                        : `${Math.max((bucket.ratingCount / maxRecentRatings) * 100, 4)}%`,
                  }}
                />
              </div>
              <p className="text-center text-[11px] text-slate-500 dark:text-slate-300">
                {bucket.dateLabel}
              </p>
              <p className="text-center text-xs font-semibold text-slate-900 dark:text-slate-100">
                {formatNumber(bucket.ratingCount)}
              </p>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Vote Distribution"
        description="How user vote values are distributed across visible caption feedback."
      >
        {stats.voteDistribution.length === 0 ? (
          <p className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4 text-sm text-slate-500 dark:text-slate-300">
            No vote distribution is available yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {stats.voteDistribution.map((bucket) => (
              <div key={bucket.voteValue} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Vote {bucket.voteValue}
                  </span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {formatNumber(bucket.count)}
                  </span>
                </div>
                <ProgressBar
                  value={
                    maxVoteDistribution === 0
                      ? 0
                      : (bucket.count / maxVoteDistribution) * 100
                  }
                />
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}

export function CaptionStatsDashboard({ stats }: CaptionStatsDashboardProps) {
  const voteCoverage = getPercent(
    stats.summary.ratedCaptions,
    stats.summary.totalCaptions,
  );
  const showCaptionRanking =
    stats.summary.totalRatings >= MIN_VOTES_FOR_CAPTION_RANKING &&
    stats.topCaptions.length > 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,#172033,#22324b)] p-8 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase text-[#f9c28f]">
            <span className="h-2 w-2 rounded-full bg-[#f2a65a]" />
            Statistics
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
            Prompt Chain Performance
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-200">
            Summary of prompt-chain setup, caption generation output, and
            available user feedback.
          </p>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Humor Flavors"
            value={formatNumber(stats.setup.totalHumorFlavors)}
            note="Configured humor styles available to admins."
          />
          <StatCard
            label="Total Prompt Chains"
            value={formatNumber(stats.setup.totalPromptChains)}
            note="Recorded prompt-chain runs."
          />
          <StatCard
            label="Total Flavor Steps"
            value={formatNumber(stats.setup.totalFlavorSteps)}
            note="Configured workflow steps across flavors."
          />
          <StatCard
            label="Generated Captions"
            value={formatNumber(stats.summary.totalCaptions)}
            note="Generated captions available to admins."
          />
          <StatCard
            label="Vote Coverage"
            value={`${voteCoverage.toFixed(1)}%`}
            note={`${formatNumber(stats.summary.ratedCaptions)} captions with votes.`}
          />
        </dl>
      </section>

      <SetupHealth stats={stats} />
      <CaptionGenerationByFlavor rows={stats.byFlavor} />
      <FeedbackTrends stats={stats} />

      {showCaptionRanking ? (
        <DashboardPanel
          title="Highest Vote Score Captions"
          description="Shown only when enough visible votes exist to avoid overemphasizing sparse feedback."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.topCaptions.slice(0, 4).map((caption) => (
              <article
                key={caption.id}
                className="rounded-[1.25rem] border border-[var(--border)] bg-[color:var(--panel-strong)] p-4"
              >
                <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
                  {caption.content}
                </p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
                  {caption.flavorLabel} · average vote score{" "}
                  {caption.averageRating.toFixed(2)} ·{" "}
                  {formatNumber(caption.ratingCount)} votes
                </p>
              </article>
            ))}
          </div>
        </DashboardPanel>
      ) : null}
    </div>
  );
}
