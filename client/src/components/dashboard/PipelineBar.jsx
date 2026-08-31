import { STATUS_COLORS } from "../../utils/chartColors";

const STAGES = [
  { key: "saved", label: "Saved", color: STATUS_COLORS.SAVED },
  { key: "applied", label: "Applied", color: STATUS_COLORS.APPLIED },
  { key: "interview", label: "Interview", color: STATUS_COLORS.INTERVIEW },
  { key: "offer", label: "Offer", color: STATUS_COLORS.OFFER },
];

export default function PipelineBar({ funnel }) {
  const segments = STAGES.map((s) => ({ ...s, count: funnel[s.key] ?? 0 })).filter((s) => s.count > 0);
  const empty = segments.length === 0;

  return (
    <div className="rounded-2xl border border-white/8 bg-surface p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
      {empty ? (
        <div className="flex h-[46px] items-center justify-center rounded-lg border border-dashed border-white/12 text-[12.5px] text-slate-500">
          No applications yet — save roles from the Jobs page to start your pipeline.
        </div>
      ) : (
        <div className="flex h-[46px] gap-1" role="img" aria-label={segments.map((s) => `${s.count} ${s.label}`).join(", ")}>
          {segments.map((s) => (
            <div
              key={s.key}
              className="flex min-w-[58px] flex-col justify-center overflow-hidden rounded-md px-3 text-[#06121e]"
              style={{ flexGrow: s.count, background: `linear-gradient(180deg, ${s.color}, ${s.color}cc)` }}
            >
              <span className="font-display text-[16px] font-semibold leading-none">{s.count}</span>
              <span className="mt-0.5 text-[10.5px] font-semibold tracking-[0.02em] opacity-80">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {funnel.everApplied > 0 && (
        <div className="mt-3.5 flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-white/8 pt-3.5">
          <FlowStep k="Applied → response" v={`${funnel.replyToInterview}%`} label="reached interview+" />
          <FlowStep k="Interview → offer" v={`${funnel.interviewToOffer}%`} label="converted" />
          <FlowStep k="Ever applied" v={funnel.everApplied} label="total" />
          <FlowStep k="Closed out" v={funnel.rejected} label="rejected" danger />
        </div>
      )}
    </div>
  );
}

function FlowStep({ k, v, label, danger }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">{k}</span>
      <span className="text-[12.5px] text-slate-400">
        <b className={`font-display font-semibold ${danger ? "text-danger" : "text-white"}`}>{v}</b> {label}
      </span>
    </div>
  );
}
