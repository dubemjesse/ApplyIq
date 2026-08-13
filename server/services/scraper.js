const prisma = require("../utils/prisma");
const { fetchGreenhouseJobs } = require("./adapters/greenhouse");
const { fetchLeverJobs } = require("./adapters/lever");
const { fetchRapidApiJobs } = require("./adapters/rapidapi");
const { GREENHOUSE_BOARDS, LEVER_BOARDS } = require("../config/jobSources");

function matchesFilters(job, filters) {
  if (filters.role) {
    const role = filters.role.toLowerCase();
    if (!job.title.toLowerCase().includes(role)) return false;
  }
  if (filters.location && !filters.remote) {
    const location = filters.location.toLowerCase();
    if (!(job.location || "").toLowerCase().includes(location)) return false;
  }
  if (filters.remote && !job.remote) return false;
  return true;
}

function dedupeByUrl(listings) {
  const seen = new Map();
  for (const listing of listings) {
    if (!seen.has(listing.url)) seen.set(listing.url, listing);
  }
  return [...seen.values()];
}

/**
 * Fetches and normalizes listings from all configured sources, filtered by
 * the given criteria. Does not touch the database — see storeJobListings().
 * @param {{ role?: string, location?: string, remote?: boolean, salaryMin?: number, experienceLevel?: string }} filters
 */
async function scrapeJobs(filters = {}) {
  const [rapidApiResults, ...boardResults] = await Promise.allSettled([
    filters.role ? fetchRapidApiJobs(filters) : Promise.resolve([]),
    ...GREENHOUSE_BOARDS.map((token) => fetchGreenhouseJobs(token)),
    ...LEVER_BOARDS.map((token) => fetchLeverJobs(token)),
  ]);

  const allResults = [rapidApiResults, ...boardResults]
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  const filtered = allResults.filter((job) => matchesFilters(job, filters));

  if (filters.salaryMin) {
    return dedupeByUrl(filtered).filter(
      (job) => job.salaryMax == null || job.salaryMax >= filters.salaryMin
    );
  }

  return dedupeByUrl(filtered);
}

/**
 * Upserts normalized listings into Postgres, keyed by their unique URL.
 * @param {Array<object>} listings
 * @returns {Promise<number>} number of listings written
 */
async function storeJobListings(listings) {
  for (const job of listings) {
    await prisma.jobListing.upsert({
      where: { url: job.url },
      update: {
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        remote: job.remote,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        experienceLevel: job.experienceLevel,
        source: job.source,
        externalId: job.externalId,
      },
      create: job,
    });
  }
  return listings.length;
}

module.exports = { scrapeJobs, storeJobListings };
