// JSearch (RapidAPI) — a licensed aggregator that legitimately re-serves
// LinkedIn/Indeed/Glassdoor/ZipRecruiter listings, avoiding the ToS and
// bot-detection issues of scraping those sites directly.
// https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
const SOURCE_BY_PUBLISHER = [
  [/linkedin/i, "LINKEDIN"],
  [/indeed/i, "INDEED"],
  [/glassdoor/i, "GLASSDOOR"],
];

function mapSource(publisher = "") {
  const match = SOURCE_BY_PUBLISHER.find(([pattern]) => pattern.test(publisher));
  return match ? match[1] : "OTHER";
}

/**
 * @param {{ role: string, location?: string, remote?: boolean, experienceLevel?: string }} filters
 */
async function fetchRapidApiJobs(filters) {
  if (!process.env.RAPIDAPI_KEY) {
    console.warn("[rapidapi] RAPIDAPI_KEY not set — skipping LinkedIn/Indeed/Glassdoor source");
    return [];
  }

  const queryParts = [filters.experienceLevel, filters.role].filter(Boolean);
  const query = filters.location ? `${queryParts.join(" ")} in ${filters.location}` : queryParts.join(" ");

  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: "1",
    ...(filters.remote ? { remote_jobs_only: "true" } : {}),
  });

  const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) {
    console.error(`[rapidapi] request failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const { data = [] } = await res.json();

  return data.map((job) => ({
    title: job.job_title,
    company: job.employer_name,
    description: job.job_description || "",
    url: job.job_apply_link,
    location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || null,
    remote: Boolean(job.job_is_remote),
    salaryMin: job.job_min_salary ?? null,
    salaryMax: job.job_max_salary ?? null,
    experienceLevel: filters.experienceLevel || null,
    source: mapSource(job.job_publisher),
    externalId: job.job_id,
    scrapedAt: new Date(),
  }));
}

module.exports = { fetchRapidApiJobs };
