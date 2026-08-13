const prisma = require("../utils/prisma");
const { scrapeJobs, storeJobListings } = require("../services/scraper");
const { matchJobToProfile } = require("../services/matcher");

async function listJobs(req, res, next) {
  try {
    const { role, location, remote, salaryMin, experienceLevel, source, page = "1", pageSize = "20" } = req.query;

    const where = {};
    if (role) where.title = { contains: role, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (remote !== undefined) where.remote = remote === "true";
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (source) where.source = source;
    if (salaryMin) {
      const min = Number(salaryMin);
      where.OR = [{ salaryMax: { gte: min } }, { salaryMax: null }];
    }

    const take = Math.min(Number(pageSize) || 20, 50);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [jobs, total] = await Promise.all([
      prisma.jobListing.findMany({ where, orderBy: { scrapedAt: "desc" }, take, skip }),
      prisma.jobListing.count({ where }),
    ]);

    // Merge in this user's match data (if any jobs on this page have been scored).
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id, jobId: { in: jobs.map((j) => j.id) } },
      select: { id: true, jobId: true, status: true, matchScore: true, matchReasoning: true, skillGaps: true },
    });
    const matchByJobId = new Map(applications.map((a) => [a.jobId, a]));
    const jobsWithMatch = jobs.map((job) => ({ ...job, match: matchByJobId.get(job.id) || null }));

    res.json({ jobs: jobsWithMatch, total, page: Number(page) || 1, pageSize: take });
  } catch (err) {
    next(err);
  }
}

async function triggerScrape(req, res, next) {
  try {
    const { role, location, remote, salaryMin, experienceLevel } = req.body;
    const filters = {
      role,
      location,
      remote: Boolean(remote),
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      experienceLevel,
    };

    const listings = await scrapeJobs(filters);
    const count = await storeJobListings(listings);

    res.json({ count, jobs: listings });
  } catch (err) {
    next(err);
  }
}

async function matchJob(req, res, next) {
  try {
    const { id } = req.params;

    const [job, user] = await Promise.all([
      prisma.jobListing.findUnique({ where: { id } }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { skills: true, preferences: true, resumeStructured: true },
      }),
    ]);
    if (!job) return res.status(404).json({ message: "Job listing not found" });

    const { score, reasoning, skillGaps } = await matchJobToProfile(user, job);

    const application = await prisma.application.upsert({
      where: { userId_jobId: { userId: req.user.id, jobId: id } },
      update: { matchScore: score, matchReasoning: reasoning, skillGaps },
      create: {
        userId: req.user.id,
        jobId: id,
        matchScore: score,
        matchReasoning: reasoning,
        skillGaps,
      },
      include: { job: true },
    });

    res.json({ application });
  } catch (err) {
    next(err);
  }
}

module.exports = { listJobs, triggerScrape, matchJob };
