export default function SkillGapList({ gaps = [] }) {
  const top = gaps.slice(0, 5);
  const max = Math.max(...top.map((g) => g.count), 1);

  return (
    <div className="min-w-0 rounded-2xl border border-white/8 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_14px_32px_-18px_rgba(0,0,0,0.7)]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[13.5px] font-semibold text-white">Skill gaps</h3>
        <span className="hidden truncate font-mono text-[11px] text-slate-500 sm:block">asked for, not on your profile</span>
      </div>

      {top.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-slate-500">
          No gaps yet — match some jobs and ApplyIQ will surface the skills they ask for that your profile doesn’t show.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-col">
            {top.map((g) => (
              <div key={g.skill} className="grid grid-cols-[84px_1fr_24px] items-center gap-3 py-[7px] sm:grid-cols-[116px_1fr_26px]">
                <span className="truncate text-[12.5px] text-white">{g.skill}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#2b6fb6] to-electric-light"
                    style={{ width: `${Math.round((g.count / max) * 100)}%` }}
                  />
                </span>
                <span className="text-right font-mono text-[11px] text-slate-400">{g.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-3.5 border-t border-white/8 pt-3.5 text-[12px] text-slate-400">
            Adding <span className="text-electric-light">{top[0].skill}</span> to your profile would strengthen{" "}
            {top[0].count} of your matches.
          </p>
        </>
      )}
    </div>
  );
}
