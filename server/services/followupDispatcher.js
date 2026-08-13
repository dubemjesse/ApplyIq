const prisma = require("../utils/prisma");
const { sendEmail } = require("./emailService");

/**
 * Sends a single follow-up email and marks it sent. Shared by the scheduled
 * cron path (via the Bull queue) and the manual "send now" API action, so
 * both converge on identical send/idempotency logic.
 * @param {string} followUpId
 */
async function dispatchFollowUp(followUpId) {
  const followUp = await prisma.followUp.findUnique({
    where: { id: followUpId },
    include: { application: { include: { user: true, job: true } } },
  });
  if (!followUp) throw new Error(`FollowUp ${followUpId} not found`);
  if (followUp.sent) return followUp; // already sent — no-op, keeps the queue idempotent

  await sendEmail({
    to: followUp.application.user.email,
    subject: followUp.emailSubject,
    text: followUp.emailBody,
  });

  return prisma.followUp.update({
    where: { id: followUpId },
    data: { sent: true, sentAt: new Date() },
  });
}

module.exports = { dispatchFollowUp };
