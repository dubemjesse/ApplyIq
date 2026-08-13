// Validated against the ApplyIQ dark navy chart surface via the dataviz
// skill's palette validator (scripts/validate_palette.js --mode dark
// --surface #0a1930) — all CVD-separation, contrast, and lightness checks
// pass for this exact set in this exact order. Don't reorder or swap hues
// without re-validating.
export const STATUS_COLORS = {
  SAVED: "#3987e5",
  APPLIED: "#d95926",
  INTERVIEW: "#199e70",
  OFFER: "#c98500",
  REJECTED: "#d55181",
};

export const STATUS_LABELS = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

export const STATUS_ORDER = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

// Single-hue sequential colors for magnitude-ranking charts (skill gaps,
// top companies) — each its own one-hue ramp, per the "second sequential
// context takes the next categorical slot's hue" rule.
export const SEQUENTIAL_BLUE = "#3987e5";
export const SEQUENTIAL_ORANGE = "#d95926";

export const CHART_GRID_COLOR = "rgba(255,255,255,0.08)";
export const CHART_AXIS_COLOR = "#64748b";
