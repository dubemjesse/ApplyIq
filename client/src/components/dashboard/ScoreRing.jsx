// Small circular gauge for an AI match score (0–100).
const R = 19;
const CIRC = 2 * Math.PI * R;

export default function ScoreRing({ score = 0 }) {
  const pct = Math.max(0, Math.min(100, score));
  const offset = CIRC * (1 - pct / 100);
  const stroke = pct >= 90 ? "#97c459" : pct >= 80 ? "#5fa5eb" : pct >= 50 ? "#378add" : "#64748b";
  const text = pct >= 90 ? "text-lime-light" : pct >= 80 ? "text-electric-light" : "text-slate-300";

  return (
    <span className="relative inline-grid h-[46px] w-[46px] shrink-0 place-items-center">
      <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
        <circle cx="23" cy="23" r={R} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="4" />
        <circle
          cx="23"
          cy="23"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={`absolute font-display text-[13px] font-semibold tabular-nums ${text}`}>{score}</span>
    </span>
  );
}
