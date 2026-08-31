import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAgentRuns, useRunAgent } from "../hooks/useAgent";
import { useInsights } from "../hooks/useInsights";
import { useApplications } from "../hooks/useApplications";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import KpiTile from "../components/dashboard/KpiTile";
import AttentionCard from "../components/dashboard/AttentionCard";
import PipelineBar from "../components/dashboard/PipelineBar";
import ActivityChart from "../components/dashboard/ActivityChart";
import AgentRunPanel from "../components/dashboard/AgentRunPanel";
import TopMatches from "../components/dashboard/TopMatches";
import SkillGapList from "../components/dashboard/SkillGapList";
import {
  greeting,
  longDate,
  relativeTime,
  computeFunnel,
  weeklyVolume,
  buildAttention,
  topMatches,
  recentlyAdded,
} from "../utils/dashboard";

function SectionHeading({ children, action }) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[14px] font-semibold text-white">{children}</h2>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: insights, isLoading: insightsLoading } = useInsights();
  const { data: runs } = useAgentRuns();
  const { data: applications } = useApplications();
  const runAgent = useRunAgent();

  const funnel = useMemo(() => computeFunnel(insights?.totals), [insights]);
  const weeks = useMemo(() => weeklyVolume(insights?.weeklyBreakdown), [insights]);
  const attention = useMemo(() => buildAttention(applications), [applications]);
  const matches = useMemo(() => topMatches(applications), [applications]);
  const addedRecently = useMemo(() => recentlyAdded(applications), [applications]);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const summary = insights?.weeklySummary ?? {};
  const agentRunning = runAgent.isPending || runs?.[0]?.status === "RUNNING";

  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">{longDate()}</p>
          <h1 className="mt-2 font-display text-[27px] font-semibold tracking-tight text-white">
            {greeting()}, <span className="text-electric-light">{firstName}</span>
          </h1>
          <p className="mt-1.5 max-w-[46ch] text-[13.5px] text-slate-400">
            {funnel.interview > 0 || funnel.offer > 0
              ? `${funnel.interview} interview${funnel.interview === 1 ? "" : "s"} live and ${funnel.offer} offer${
                  funnel.offer === 1 ? "" : "s"
                } on the table.`
              : "Your job search at a glance — trigger the agent to scrape, match and generate in one run."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => runAgent.mutate()}
            disabled={agentRunning}
            className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-b from-lime to-lime/80 px-4 py-2.5 text-[13px] font-semibold text-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_20px_-10px_rgba(151,196,89,0.55)] transition-transform hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            {agentRunning ? "Agent running…" : "Run agent now"}
          </button>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            {runs?.[0] ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_0_3px_rgba(151,196,89,0.18)]" />
                Last run {relativeTime(runs[0].startedAt)} · scraped {runs[0].jobsFound} · matched {runs[0].jobsMatched}
              </>
            ) : (
              "Agent has not run yet"
            )}
          </span>
        </div>
      </header>

      {runAgent.isError && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {runAgent.error?.response?.data?.message || "Agent run failed to start"}
        </p>
      )}

      {insightsLoading && <LoadingSpinner label="Loading your dashboard…" />}

      {insights && (
        <>
          {/* Needs your attention */}
          <section className="mt-8">
            <SectionHeading>Needs your attention</SectionHeading>
            {attention.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-surface p-4 text-[13px] text-slate-400">
                You’re all caught up. Run the agent to surface new roles, or move a saved job forward on the board.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {attention.map((item) => (
                  <AttentionCard key={item.key} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* KPIs */}
          <section className="mt-8">
            <SectionHeading>This search, right now</SectionHeading>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiTile
                label="In pipeline"
                value={funnel.inPipeline}
                delta={addedRecently ? `+${addedRecently}` : null}
                deltaTone={addedRecently ? "up" : "flat"}
                foot="last 7 days"
              />
              <KpiTile
                label="Interviews"
                value={funnel.interview}
                tone="accent"
                delta={summary.thisWeekInterviewsOrOffers ? `+${summary.thisWeekInterviewsOrOffers}` : null}
                deltaTone={summary.thisWeekInterviewsOrOffers ? "up" : "flat"}
                foot={funnel.interview ? "in progress" : "none active"}
              />
              <KpiTile
                label="Offers"
                value={funnel.offer}
                tone="positive"
                foot={funnel.offer ? "awaiting your response" : "none yet"}
              />
              <KpiTile
                label="Interview rate"
                value={funnel.interviewRate}
                suffix="%"
                foot="of everything applied to"
                spark={weeks.map((w) => w.interviewsOrOffers)}
              />
            </div>
          </section>

          {/* Pipeline */}
          <section className="mt-8">
            <SectionHeading
              action={
                <Link to="/applications" className="flex items-center gap-1 text-[12.5px] text-slate-400 hover:text-electric-light">
                  Open board
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              }
            >
              Application pipeline
            </SectionHeading>
            <PipelineBar funnel={funnel} />
          </section>

          {/* Activity + agent */}
          <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div className="min-w-0 rounded-2xl border border-white/8 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-[13.5px] font-semibold text-white">Weekly activity</h3>
                <span className="hidden font-mono text-[11px] text-slate-500 sm:block">applications entering the tracker</span>
              </div>
              <ActivityChart weeks={weeks} />
              <p className="mt-3 text-[11.5px] text-slate-400">
                This week: <b className="font-semibold text-white">{summary.thisWeekTotal ?? 0} added</b>
                {summary.thisWeekInterviewsOrOffers ? `, ${summary.thisWeekInterviewsOrOffers} to interview/offer` : ""}
              </p>
            </div>
            <AgentRunPanel runs={runs ?? []} />
          </div>

          {/* Matches + skills */}
          <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
            <TopMatches matches={matches} />
            <SkillGapList gaps={insights.skillGaps ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
