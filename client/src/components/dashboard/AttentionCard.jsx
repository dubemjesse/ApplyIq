import { Link } from "react-router-dom";

const TONES = {
  positive: { edge: "border-l-lime", icon: "bg-lime/14 text-lime-light" },
  interview: { edge: "border-l-interview", icon: "bg-interview/14 text-interview" },
  warn: { edge: "border-l-warn", icon: "bg-warn/14 text-warn" },
  accent: { edge: "border-l-electric", icon: "bg-electric/14 text-electric-light" },
};

const ICONS = {
  offer: (
    <path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z M9 12l2 2 4-4" />
  ),
  interview: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18M9 15l2 2 4-4" />
    </>
  ),
  followup: (
    <>
      <path d="M4 6h16v12H4z M4 7l8 6 8-6" />
      <path d="M18 16.5V18l1 1" />
    </>
  ),
  match: <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z" />,
};

export default function AttentionCard({ item }) {
  const tone = TONES[item.tone] ?? TONES.accent;

  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3.5 rounded-xl border border-white/8 border-l-[3px] ${tone.edge} bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors hover:bg-surface-2`}
    >
      <span className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] ${tone.icon}`}>
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {ICONS[item.key] ?? ICONS.match}
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-white">{item.title}</span>
        <span className="mt-0.5 block truncate font-mono text-[11.5px] text-slate-400">{item.meta}</span>
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
