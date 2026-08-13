const prisma = require("../utils/prisma");
const { draftFollowUp } = require("../services/followupWriter");
const { dispatchFollowUp } = require("../services/followupDispatcher");

async function getOwnedApplication(applicationId, userId) {
  return prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: { user: true, job: true },
  });
}

async function listFollowUps(req, res, next) {
  try {
    const application = await getOwnedApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const followUps = await prisma.followUp.findMany({
      where: { applicationId: application.id },
      orderBy: { scheduledAt: "asc" },
    });
    res.json({ followUps });
  } catch (err) {
    next(err);
  }
}

async function createFollowUp(req, res, next) {
  try {
    const { scheduledAt } = req.body;
    const parsedDate = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "scheduledAt must be a valid date" });
    }

    const application = await getOwnedApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const { subject, body } = await draftFollowUp(application);

    const followUp = await prisma.followUp.create({
      data: {
        applicationId: application.id,
        scheduledAt: parsedDate,
        emailSubject: subject,
        emailBody: body,
      },
    });

    res.status(201).json({ followUp });
  } catch (err) {
    next(err);
  }
}

async function sendNow(req, res, next) {
  try {
    const application = await getOwnedApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const followUp = await prisma.followUp.findFirst({
      where: { id: req.params.followUpId, applicationId: application.id },
    });
    if (!followUp) return res.status(404).json({ message: "Follow-up not found" });

    const updated = await dispatchFollowUp(followUp.id);
    res.json({ followUp: updated });
  } catch (err) {
    next(err);
  }
}

async function cancelFollowUp(req, res, next) {
  try {
    const application = await getOwnedApplication(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    const followUp = await prisma.followUp.findFirst({
      where: { id: req.params.followUpId, applicationId: application.id },
    });
    if (!followUp) return res.status(404).json({ message: "Follow-up not found" });
    if (followUp.sent) return res.status(400).json({ message: "Cannot cancel a follow-up that was already sent" });

    await prisma.followUp.delete({ where: { id: followUp.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listFollowUps, createFollowUp, sendNow, cancelFollowUp };
