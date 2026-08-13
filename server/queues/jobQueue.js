// Bull queue definitions backed by Redis. Processors are attached in the
// phases that need async work (scraping in Phase 3, emails in Phase 7,
// agent runs in Phase 8). Run `npm run worker` to start a standalone processor.
require("dotenv").config();
const Queue = require("bull");
const { dispatchFollowUp } = require("../services/followupDispatcher");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const scrapeQueue = new Queue("scrape-jobs", REDIS_URL);
const emailQueue = new Queue("send-email", REDIS_URL);
const agentQueue = new Queue("agent-run", REDIS_URL);

emailQueue.process(async (job) => {
  const { followUpId } = job.data;
  await dispatchFollowUp(followUpId);
});

emailQueue.on("failed", (job, err) => {
  console.error(`[worker] follow-up ${job.data.followUpId} failed:`, err.message);
});

if (require.main === module) {
  console.log("[worker] ApplyIQ queue worker started, waiting for jobs...");
}

module.exports = { scrapeQueue, emailQueue, agentQueue };
