// Hand-drawn area chart of weekly application volume. Kept as inline SVG
// (rather than Recharts) so it matches the dashboard's visual language.
const W = 560;
const H = 168;
const TOP = 16;
const BOTTOM = 140;

export default function ActivityChart({ weeks = [] }) {
  const data = weeks.length ? weeks : [{ week: "", total: 0 }];
  const max = Math.max(...data.map((d) => d.total), 1);
  const span = data.length > 1 ? (W - 24) / (data.length - 1) : 0;

  const x = (i) => 12 + i * span;
  const y = (v) => BOTTOM - (v / max) * (BOTTOM - TOP);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.total)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${BOTTOM} L${x(0)},${BOTTOM} Z`;
  const lastX = x(data.length - 1);
  const lastY = y(data[data.length - 1].total);

  return (
    <div className="mt-3.5">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[172px] w-full" role="img" aria-label="Weekly application volume">
        <defs>
          <linearGradient id="activityArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#378add" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#378add" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" y1={TOP + f * (BOTTOM - TOP)} x2={W} y2={TOP + f * (BOTTOM - TOP)} stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#activityArea)" />
        <path d={line} fill="none" stroke="#5fa5eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="4.5" fill="#0c2138" stroke="#5fa5eb" strokeWidth="2.4" />
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500">
        {data.map((d, i) => (
          <span key={i}>{d.week ? d.week.split("-")[1] : ""}</span>
        ))}
      </div>
    </div>
  );
}
