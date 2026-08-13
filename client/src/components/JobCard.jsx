// Renders a single job listing with its AI match score (Phase 4),
// CV/cover letter generation (Phase 5), and application tracking (Phase 6).
export default function JobCard({ job, onMatch, matching, onGenerate, generating, onSave, saving, saved }) {
  const match = job.match;
  const scoreColor =
    match?.matchScore >= 80 ? "text-lime" : match?.matchScore >= 50 ? "text-electric-light" : "text-slate-400";

  return (
    <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4 hover:border-electric/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{job.title}</h3>
          <p className="text-sm text-slate-400">
            {job.company} · {job.location ?? "Remote"}
          </p>
        </div>
        {match?.matchScore != null ? (
          <span className={`shrink-0 text-sm font-bold ${scoreColor}`}>{match.matchScore}%</span>
        ) : (
          onMatch && (
            <button
              type="button"
              onClick={() => onMatch(job.id)}
              disabled={matching}
              className="shrink-0 rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-60"
            >
              {matching ? "Matching..." : "Match"}
            </button>
          )
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-slate-400">{job.description}</p>

      {match?.matchReasoning && (
        <p className="mt-3 rounded-md bg-navy/60 p-2 text-xs text-slate-300">{match.matchReasoning}</p>
      )}
      {match?.skillGaps?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {match.skillGaps.map((gap) => (
            <span key={gap} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">
              {gap}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="uppercase tracking-wide">{job.source}</span>
        <div className="flex items-center gap-3">
          {onGenerate && (
            <button
              type="button"
              onClick={() => onGenerate(job.id)}
              disabled={generating}
              className="text-lime hover:underline disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate CV"}
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(job.id)}
              disabled={saving || saved}
              className="text-electric-light hover:underline disabled:opacity-60"
            >
              {saved ? "Saved ✓" : saving ? "Saving..." : "Save"}
            </button>
          )}
          <a href={job.url} target="_blank" rel="noreferrer" className="text-electric-light hover:underline">
            View listing
          </a>
        </div>
      </div>
    </div>
  );
}
