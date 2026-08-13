const prisma = require("../utils/prisma");

const STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

async function listApplications(req, res, next) {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: { updatedAt: "desc" },
    });

    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

async function createApplication(req, res, next) {
  try {
    const { jobId, status, notes, contactName, contactEmail } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const job = await prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Job listing not found" });

    const data = { notes, contactName, contactEmail };
    if (status) {
      data.status = status;
      if (status === "APPLIED") data.appliedAt = new Date();
    }

    const application = await prisma.application.upsert({
      where: { userId_jobId: { userId: req.user.id, jobId } },
      update: data,
      create: { userId: req.user.id, jobId, ...data },
      include: { job: true },
    });

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
}

async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes, contactName, contactEmail } = req.body;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(", ")}` });
    }

    const existing = await prisma.application.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: "Application not found" });

    const data = {};
    if (status !== undefined) {
      data.status = status;
      if (status === "APPLIED" && !existing.appliedAt) data.appliedAt = new Date();
    }
    if (notes !== undefined) data.notes = notes;
    if (contactName !== undefined) data.contactName = contactName;
    if (contactEmail !== undefined) data.contactEmail = contactEmail;

    const application = await prisma.application.update({
      where: { id },
      data,
      include: { job: true },
    });

    res.json({ application });
  } catch (err) {
    next(err);
  }
}

async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.application.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: "Application not found" });

    await prisma.application.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listApplications, createApplication, updateApplication, deleteApplication };
