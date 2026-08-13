// Master orchestration agent: scrape -> match -> surface top matches ->
// generate CVs for top picks -> notify. Every run is logged to AgentRun,
// triggered either manually (POST /api/agent/run) or by the daily cron in
// scheduler.js.
const prisma = require("../utils/prisma");
const { scrapeJobs, storeJobListings } = require("./scraper");
const { matchJobToProfile } = require("./matcher");
const { generateDocuments } = require("./generator");
const { sendEmail } = require("./emailService");

const MAX_JOBS_TO_MATCH = 20;
const TOP_MATCHES_TO_SURFACE = 10;
const TOP_MATCHES_TO_GENERATE = 3;

function buildDigestEmail(user, topMatches) {
  const lines = topMatches.map(
    (m, i) => `${i + 1}. ${m.job.title} @ ${m.job.company} — ${m.score}% match\n   ${m.job.url}`
  );
  return {
    subject: `ApplyIQ digest: ${topMatches.length} new matches found`,
    text: `Hi ${user.name},\n\nYour daily job search agent run found these top matches:\n\n${lines.join(
      "\n\n"
    )}\n\nTailored CVs and cover letters were generated for your top ${Math.min(
      TOP_MATCHES_TO_GENERATE,
      topMatches.length
    )} matches — check the Jobs page in ApplyIQ to download them.\n`,
  };
}

/**
 * @param {string} userId
 * @returns {Promise<object>} the completed AgentRun record
 */
async function runAgentForUser(userId) {
  const run = await prisma.agentRun.create({
    data: { userId, status: "RUNNING" },
  });

  const log = { steps: [] };
  let jobsFound = 0;
  let jobsMatched = 0;
  let documentsGenerated = 0;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, skills: true, preferences: true, resumeStructured: true },
    });
    if (!user) throw new Error(`User ${userId} not found`);
    const preferences = user.preferences || {};

    // Step 1: scrape new jobs matching the user's stated preferences.
    const listings = await scrapeJobs({
      role: preferences.targetRoles?.[0],
      location: preferences.locations?.[0],
      remote: preferences.remote,
      experienceLevel: preferences.experienceLevel,
    });
    await storeJobListings(listings);
    jobsFound = listings.length;
    log.steps.push({ step: "scrape", jobsFound });

    const candidateJobs = await prisma.jobListing.findMany({
      where: { url: { in: listings.map((l) => l.url) } },
      take: MAX_JOBS_TO_MATCH,
    });

    // Step 2: match each candidate job against the user's profile.
    const matchResults = [];
    const matchErrors = [];
    for (const job of candidateJobs) {
      try {
        const { score, reasoning, skillGaps } = await matchJobToProfile(user, job);
        matchResults.push({ job, score, reasoning, skillGaps });
      } catch (err) {
        matchErrors.push({ jobId: job.id, error: err.message });
      }
    }
    // If matching was attempted but every single call failed (e.g. no
    // ANTHROPIC_API_KEY configured), the matching step is fundamentally
    // broken — fail the whole run rather than silently reporting 0 matches.
    if (candidateJobs.length > 0 && matchResults.length === 0) {
      throw new Error(matchErrors[0]?.error || "Job matching failed for all candidates");
    }
    jobsMatched = matchResults.length;
    log.steps.push({ step: "match", jobsMatched, failures: matchErrors.length });

    // Step 3: surface the top matches and upsert them into the tracker as SAVED.
    const topMatches = matchResults.sort((a, b) => b.score - a.score).slice(0, TOP_MATCHES_TO_SURFACE);
    for (const match of topMatches) {
      await prisma.application.upsert({
        where: { userId_jobId: { userId, jobId: match.job.id } },
        update: { matchScore: match.score, matchReasoning: match.reasoning, skillGaps: match.skillGaps },
        create: {
          userId,
          jobId: match.job.id,
          matchScore: match.score,
          matchReasoning: match.reasoning,
          skillGaps: match.skillGaps,
        },
      });
    }
    log.steps.push({ step: "surface", topMatches: topMatches.length });

    // Step 4: auto-generate tailored CVs + cover letters for the top picks.
    const toGenerate = topMatches.slice(0, TOP_MATCHES_TO_GENERATE);
    const generateErrors = [];
    for (const match of toGenerate) {
      try {
        const { cv, coverLetter } = await generateDocuments(user, match.job);
        await prisma.generatedDocument.createMany({
          data: [
            { userId, jobId: match.job.id, type: "CV", content: cv },
            { userId, jobId: match.job.id, type: "COVER_LETTER", content: coverLetter },
          ],
        });
        documentsGenerated += 2;
      } catch (err) {
        generateErrors.push({ jobId: match.job.id, error: err.message });
      }
    }
    log.steps.push({ step: "generate", documentsGenerated, failures: generateErrors.length });

    // Step 5: notify the user with an email digest. Not fatal to the run —
    // the scrape/match/generate work already happened even if email fails.
    try {
      if (topMatches.length > 0) {
        await sendEmail({ to: user.email, ...buildDigestEmail(user, topMatches) });
        log.steps.push({ step: "notify", sent: true });
      } else {
        log.steps.push({ step: "notify", sent: false, reason: "no matches to report" });
      }
    } catch (err) {
      log.steps.push({ step: "notify", sent: false, error: err.message });
    }

    return prisma.agentRun.update({
      where: { id: run.id },
      data: { status: "SUCCESS", jobsFound, jobsMatched, documentsGenerated, log, endedAt: new Date() },
    });
  } catch (err) {
    return prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        jobsFound,
        jobsMatched,
        documentsGenerated,
        log,
        error: err.message,
        endedAt: new Date(),
      },
    });
  }
}

module.exports = { runAgentForUser };
