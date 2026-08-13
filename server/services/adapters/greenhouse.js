const { htmlToText } = require("./htmlToText");

// Greenhouse Job Board API — public, read-only, no auth or scraping required.
// https://developers.greenhouse.io/job-board.html
async function fetchGreenhouseJobs(boardToken) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const { jobs = [] } = await res.json();
  return jobs.map((job) => ({
    title: job.title,
    company: job.company_name || boardToken,
    description: htmlToText(job.content || ""),
    url: job.absolute_url,
    location: job.location?.name || null,
    remote: /remote/i.test(job.location?.name || ""),
    salaryMin: null,
    salaryMax: null,
    experienceLevel: null,
    source: "GREENHOUSE",
    externalId: String(job.id),
    scrapedAt: new Date(),
  }));
}

module.exports = { fetchGreenhouseJobs };
