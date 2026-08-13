// Minimal HTML -> plain text conversion for job descriptions coming back
// from Greenhouse/Lever as HTML. Good enough for storage/matching purposes
// without pulling in a full HTML parser dependency.
function htmlToText(html = "") {
  return html
    // Some sources (e.g. Greenhouse) entity-encode their HTML, so tags arrive
    // as "&lt;h2&gt;" rather than "<h2>" — decode entities before stripping
    // tags, or the tag-stripping regex never matches anything.
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = { htmlToText };
