// Shows the master orchestration agent's latest run + a manual trigger button.
// Wired to AgentRun records and POST /api/agent/run in Phase 8.
export default function AgentStatus({ lastRun, onRunNow, running = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Orchestration Agent</h3>
        <button
          onClick={onRunNow}
          disabled={running}
          className="rounded-md bg-lime px-3 py-1.5 text-xs font-semibold text-navy hover:bg-lime-light disabled:opacity-60"
        >
          {running ? "Running..." : "Run Agent Now"}
        </button>
      </div>
      {lastRun ? (
        <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd className="text-slate-200">{lastRun.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Jobs found</dt>
            <dd className="text-slate-200">{lastRun.jobsFound}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Started</dt>
            <dd className="text-slate-200">{new Date(lastRun.startedAt).toLocaleString()}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No runs yet.</p>
      )}
    </div>
  );
}
