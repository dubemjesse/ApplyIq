const prisma = require("../utils/prisma");
const { generateDocuments } = require("../services/generator");
const { renderPdf, renderDocx } = require("../services/documents/render");

async function generate(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });

    const [job, user] = await Promise.all([
      prisma.jobListing.findUnique({ where: { id: jobId } }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { skills: true, preferences: true, resumeStructured: true },
      }),
    ]);
    if (!job) return res.status(404).json({ message: "Job listing not found" });

    const { cv, coverLetter } = await generateDocuments(user, job);

    const [cvDoc, coverLetterDoc] = await Promise.all([
      prisma.generatedDocument.create({
        data: { userId: req.user.id, jobId, type: "CV", content: cv },
      }),
      prisma.generatedDocument.create({
        data: { userId: req.user.id, jobId, type: "COVER_LETTER", content: coverLetter },
      }),
    ]);

    res.status(201).json({ cv: cvDoc, coverLetter: coverLetterDoc });
  } catch (err) {
    next(err);
  }
}

async function listForJob(req, res, next) {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ message: "jobId query param is required" });

    const documents = await prisma.generatedDocument.findMany({
      where: { userId: req.user.id, jobId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const { id } = req.params;
    const format = (req.query.format || "pdf").toLowerCase();
    if (!["pdf", "docx"].includes(format)) {
      return res.status(400).json({ message: "format must be 'pdf' or 'docx'" });
    }

    const document = await prisma.generatedDocument.findFirst({
      where: { id, userId: req.user.id },
      include: { job: true },
    });
    if (!document) return res.status(404).json({ message: "Document not found" });

    const title = document.type === "CV" ? `CV — ${document.job.title}` : `Cover Letter — ${document.job.title}`;
    const buffer =
      format === "pdf" ? await renderPdf(title, document.content) : await renderDocx(title, document.content);

    const filenameBase = `${document.type.toLowerCase()}-${document.job.company}`.replace(/[^a-z0-9-]+/gi, "_");
    res.setHeader(
      "Content-Type",
      format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filenameBase}.${format}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { generate, listForJob, download };
