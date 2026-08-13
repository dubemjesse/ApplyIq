// Greenhouse and Lever don't offer a global "search all companies" endpoint —
// each company hosts its own board under its own token. This is a curated
// starter list of real, currently-active boards; add your own via the env
// vars below (comma-separated tokens).
const GREENHOUSE_BOARDS = (process.env.GREENHOUSE_BOARDS || "stripe,airbnb,coinbase,robinhood")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const LEVER_BOARDS = (process.env.LEVER_BOARDS || "palantir")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = { GREENHOUSE_BOARDS, LEVER_BOARDS };
