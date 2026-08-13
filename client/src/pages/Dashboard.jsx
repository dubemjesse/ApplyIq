import { useAgentRuns, useRunAgent } from "../hooks/useAgent";
import { useInsights } from "../hooks/useInsights";
import AgentStatus from "../components/AgentStatus";
import LoadingSpinner from "../components/LoadingSpinner";
import StatTile from "../components/StatTile";
import StatusBreakdownChart from "../components/StatusBreakdownChart";
import WeeklyTrendChart from "../components/WeeklyTrendChart";
import RankedBarChart from "../components/RankedBarChart";
import { SEQUENTIAL_BLUE, SEQUENTIAL_ORANGE } from "../utils/chartColors";

const STATUS_STYLES = {
  SUCCESS: "text-lime",
  RUNNING: "text-electric-light",
  FAILED: "text-red-400",
};

export default function Dashboard() {
  const { data: runs, isLoading: runsLoading } = useAgentRuns();
  const runAgent = useRunAgent();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  const lastRun = runs?.[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">
        Your job search at a glance. Trigger the orchestration agent to scrape, match, generate, and notify in one run.
      </p>

      {insightsLoading && <LoadingSpinner label="Loading insights..." />}

      {insights && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Jobs in system" value={insights.totals.totalJobsInDb} />
            <StatTile label="Total applications" value={insights.totals.totalApplications} />
            <StatTile label="Interviews" value={insights.totals.INTERVIEW} accent="text-electric-light" />
            <StatTile label="Offers" value={insights.totals.OFFER} accent="text-lime" />
          </div>

          {insights.weeklySummary.thisWeekTotal > 0 || insights.weeklySummary.lastWeekTotal > 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              This week: <span className="text-slate-200">{insights.weeklySummary.thisWeekTotal}</span> applications
              added ({insights.weeklySummary.thisWeekInterviewsOrOffers} at interview/offer stage), vs{" "}
              {insights.weeklySummary.lastWeekTotal} last week.
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Applications by stage</h2>
              <div className="mt-2">
                <StatusBreakdownChart totals={insights.totals} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Weekly activity</h2>
              <div className="mt-2">
                <WeeklyTrendChart data={insights.weeklyBreakdown} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Skills gap analysis</h2>
              <p className="mt-1 text-xs text-slate-400">
                Skills your matched jobs ask for that your profile doesn't show, ranked by frequency.
              </p>
              <div className="mt-3">
                <RankedBarChart
                  data={insights.skillGaps}
                  labelKey="skill"
                  valueKey="count"
                  color={SEQUENTIAL_BLUE}
                  emptyText="No skill gaps yet — match some jobs on the Jobs page to see this."
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
              <h2 className="text-sm font-semibold text-white">Most active hiring companies</h2>
              <p className="mt-1 text-xs text-slate-400">Companies with the most listings currently in ApplyIQ.</p>
              <div className="mt-3">
                <RankedBarChart
                  data={insights.topCompanies}
                  labelKey="company"
                  valueKey="count"
                  color={SEQUENTIAL_ORANGE}
                  emptyText="No jobs scraped yet — try Scrape now on the Jobs page."
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <AgentStatus lastRun={lastRun} onRunNow={() => runAgent.mutate()} running={runAgent.isPending} />
      </div>

      {runAgent.isError && (
        <p className="mt-3 text-xs text-red-400">
          {runAgent.error?.response?.data?.message || "Agent run failed to start"}
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Run history</h2>
        {runsLoading && <LoadingSpinner label="Loading run history..." />}
        {runs && runs.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">No agent runs yet — click "Run Agent Now" above to start one.</p>
        )}
        {runs && runs.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-light/40 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2">Started</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Jobs found</th>
                  <th className="px-4 py-2">Matched</th>
                  <th className="px-4 py-2">Documents</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {runs.map((run) => (
                  <tr key={run.id} className="text-slate-300">
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(run.startedAt).toLocaleString()}</td>
                    <td className={`px-4 py-2 font-medium ${STATUS_STYLES[run.status] || ""}`}>{run.status}</td>
                    <td className="px-4 py-2">{run.jobsFound}</td>
                    <td className="px-4 py-2">{run.jobsMatched}</td>
                    <td className="px-4 py-2">{run.documentsGenerated}</td>
                    <td className="px-4 py-2 max-w-xs truncate text-xs text-red-400" title={run.error || ""}>
                      {run.error || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
