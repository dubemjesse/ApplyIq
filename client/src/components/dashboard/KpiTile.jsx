// One hero metric. Big display number, a colour-coded delta chip or a
// contextual line, and an optional sparkline in the top-right corner.
function Sparkline({ values }) {
  if (!values || values.length < 2 || values.every((v) => !v)) return null;
  const max = Math.max(...values, 1);
  const step = 74 / (values.length - 1);
  const pts = values.map((v, i) => `${i * step + 1},${28 - (v / max) * 24}`);
  const last = pts[pts.length - 1].split(",");

  return (
    <svg className="absolute right-4 top-4 h-[30px] w-[76px] opacity-90" viewBox="0 0 76 30" fill="none" aria-hidden="true">
      <polyline points={pts.join(" ")} stroke="#5fa5eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill="#5fa5eb" />
    </svg>
  );
}

const VALUE_TONE = {
  default: "text-white",
  accent: "text-electric-light",
  positive: "text-lime",
};

export default function KpiTile({ label, value, suffix, tone = "default", delta, deltaTone = "up", foot, spark }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-surface p-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
      <Sparkline values={spark} />
      <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className={`mt-2.5 font-display text-[34px] font-semibold leading-none tracking-tight tabular-nums ${VALUE_TONE[tone]}`}>
        {value}
        {suffix && <span className="ml-0.5 text-[17px] font-medium text-slate-400">{suffix}</span>}
      </p>
      <div className="mt-2.5 flex items-center gap-2 text-[12px] text-slate-400">
        {delta != null && (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium ${
              deltaTone === "up" ? "bg-lime/12 text-lime-light" : "bg-white/6 text-slate-400"
            }`}
          >
            {deltaTone === "up" && (
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 14l5-5 5 5" />
              </svg>
            )}
            {delta}
          </span>
        )}
        {foot && <span className="truncate">{foot}</span>}
      </div>
    </div>
  );
}
