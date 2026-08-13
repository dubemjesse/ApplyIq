import { useState } from "react";

// Minimal chip/tag input used for skills, target roles, and locations in the
// profile builder. Value is always a plain string array.
export default function TagInput({ label, value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-slate-300">{label}</label>}
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-navy px-2 py-2 focus-within:border-electric">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-electric/15 px-2.5 py-1 text-xs text-electric-light"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-electric-light/70 hover:text-electric-light"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[8ch] flex-1 bg-transparent py-0.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
