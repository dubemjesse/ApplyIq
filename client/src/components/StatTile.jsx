export default function StatTile({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-light/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}
