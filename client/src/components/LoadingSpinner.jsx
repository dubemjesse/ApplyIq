export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-electric-light"
        aria-hidden="true"
      />
      {label}
    </div>
  );
}
