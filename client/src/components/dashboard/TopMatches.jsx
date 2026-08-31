import ScoreRing from "./ScoreRing";

export default function TopMatches({ matches = [] }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex items-baseline justify-between px-5 pt-[18px]">
        <h3 className="font-display text-[13.5px] font-semibold text-white">Top matches</h3>
        <span className="hidden font-mono text-[11px] text-slate-500 sm:block">not applied yet</span>
      </div>

      {matches.length === 0 ? (
        <p className="px-5 pb-5 pt-3 text-[12.5px] text-slate-500">
          Match roles on the Jobs page (or run the agent) to see your strongest fits here.
        </p>
      ) : (
        <div className="px-2.5 py-2">
          {matches.map((m, i) => (
            <a
              key={m.id}
              href={m.job.url}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2 ${i > 0 ? "border-t border-white/8" : ""}`}
            >
              <ScoreRing score={m.matchScore} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-white">{m.job.title}</span>
                <span className="mt-0.5 block truncate font-mono text-[11.5px] text-slate-400">
                  {m.job.company} · {m.job.remote ? "Remote" : m.job.location ?? "—"}
                  <span className="ml-2 text-[10px] uppercase tracking-[0.06em] text-slate-500">{m.job.source}</span>
                </span>
              </span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
