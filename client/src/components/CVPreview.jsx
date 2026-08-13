// Preview pane for an AI-generated CV/cover letter before download. Built out
// alongside generator.js and the PDF/DOCX export flow in Phase 5.
export default function CVPreview({ title = "Generated document", content = "" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white text-slate-900 p-6 shadow-lg">
      <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
      <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
        {content || "Nothing generated yet."}
      </div>
    </div>
  );
}
