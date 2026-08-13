// node-cron based scheduling for recurring job search runs and follow-up
// dispatch.
const cron = require("node-cron");
const prisma = require("../utils/prisma");
const { emailQueue } = require("../queues/jobQueue");

/**
 * Finds due, unsent follow-ups and enqueues each onto the Bull email queue —
 * actual sending happens in the worker process (`npm run worker`), which
 * lets a slow/failed SMTP send retry independently of this cron tick.
 */
async function dispatchDueFollowUps() {
  const due = await prisma.followUp.findMany({
    where: { sent: false, scheduledAt: { lte: new Date() } },
    select: { id: true },
  });

  for (const followUp of due) {
    await emailQueue.add({ followUpId: followUp.id });
  }

  return due.length;
}

function startScheduledJobs() {
  // Every 15 minutes — check for due follow-ups and hand them to the queue.
  cron.schedule("*/15 * * * *", async () => {
    try {
      const count = await dispatchDueFollowUps();
      if (count > 0) console.log(`[scheduler] enqueued ${count} due follow-up(s)`);
    } catch (err) {
      console.error("[scheduler] follow-up dispatch failed:", err.message);
    }
  });

  // Daily job search run (scrape -> match -> notify) — implemented as part
  // of the master orchestration agent in Phase 8; this hook fires it once
  // agent.js is wired up.
  cron.schedule("0 7 * * *", async () => {
    const { runAgentForUser } = require("./agent");
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      try {
        await runAgentForUser(user.id);
      } catch (err) {
        console.error(`[scheduler] daily agent run failed for user ${user.id}:`, err.message);
      }
    }
  });
}

module.exports = { startScheduledJobs, dispatchDueFollowUps };
