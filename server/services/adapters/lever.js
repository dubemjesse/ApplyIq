const { htmlToText } = require("./htmlToText");

// Lever Postings API — public, read-only, no auth or scraping required.
// https://github.com/lever/postings-api
async function fetchLeverJobs(boardToken) {
  const url = `https://api.lever.co/v0/postings/${boardToken}?mode=json`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const body = await res.json();
  if (!Array.isArray(body)) return []; // Lever returns { ok:false, error } for unknown boards

  return body.map((job) => ({
    title: job.text,
    company: boardToken,
    description: job.descriptionPlain || htmlToText(job.description || job.opening || ""),
    url: job.hostedUrl,
    location: job.categories?.location || null,
    remote: job.workplaceType === "remote" || /remote/i.test(job.categories?.location || ""),
    salaryMin: null,
    salaryMax: null,
    experienceLevel: null,
    source: "LEVER",
    externalId: job.id,
    scrapedAt: new Date(),
  }));
}

module.exports = { fetchLeverJobs };
