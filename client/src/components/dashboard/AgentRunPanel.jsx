import { relativeTime } from "../../utils/dashboard";

const STATUS_DOT = {
  SUCCESS: "bg-lime shadow-[0_0_0_3px_rgba(151,196,89,0.16)]",
  RUNNING: "bg-electric-light shadow-[0_0_0_3px_rgba(99,166,234,0.2)]",
  FAILED: "bg-danger shadow-[0_0_0_3px_rgba(219,96,137,0.18)]",
};

const STATUS_LABEL = {
  SUCCESS: "Last run succeeded",
  RUNNING: "Agent is running",
  FAILED: "Last run failed",
};

export default function AgentRunPanel({ runs = [] }) {
  const last = runs[0];

  return (
    <div className="min-w-0 rounded-2xl border border-white/8 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
      <h3 className="font-display text-[13.5px] font-semibold text-white">Orchestration agent</h3>

      {!last ? (
        <p className="mt-3 text-[13px] text-slate-500">
          No runs yet — use “Run agent now” to scrape, match, generate and get a digest in one pass.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/8 bg-surface-2 px-3.5 py-3">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[last.status] ?? "bg-slate-500"}`} />
            <span className="text-[12.5px] text-slate-400">
              <b className="font-semibold text-white">{STATUS_LABEL[last.status] ?? last.status}</b> · {relativeTime(last.startedAt)}
              {last.error ? ` · ${last.error}` : " · scrape → match → generate → digest"}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8">
            <Stat v={last.jobsFound} k="Scraped" />
            <Stat v={last.jobsMatched} k="Matched" />
            <Stat v={last.documentsGenerated} k="CVs made" />
          </div>

          <div className="mt-4 flex flex-col">
            {runs.slice(0, 4).map((run, i) => (
              <div
                key={run.id}
                className={`grid grid-cols-[10px_84px_minmax(0,1fr)] items-center gap-3 py-2.5 text-[12px] ${i > 0 ? "border-t border-white/8" : ""}`}
              >
                <span className={`h-2 w-2 justify-self-center rounded-full ${STATUS_DOT[run.status] ?? "bg-slate-500"}`} />
                <span className="font-mono text-[11px] text-slate-400">{relativeTime(run.startedAt)}</span>
                <span className="truncate text-slate-400">
                  {run.status === "FAILED" ? (
                    <><b className="font-medium text-danger">Failed</b>{run.error ? ` — ${run.error}` : ""}</>
                  ) : (
                    <><b className="font-medium text-white">{run.jobsFound} scraped</b>, {run.jobsMatched} matched
                    {run.documentsGenerated ? `, ${run.documentsGenerated} CVs` : ""}</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ v, k }) {
  return (
    <div className="bg-surface px-3 py-2.5 text-center">
      <div className="font-display text-[18px] font-semibold tabular-nums text-white">{v ?? 0}</div>
      <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-slate-500">{k}</div>
    </div>
  );
}
