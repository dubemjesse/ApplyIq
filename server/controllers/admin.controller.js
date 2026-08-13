const prisma = require("../utils/prisma");

const ROLES = ["JOBSEEKER", "ADMIN"];

async function listUsers(req, res, next) {
  try {
    const { page = "1", pageSize = "20" } = req.query;
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { applications: true, agentRuns: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.user.count(),
    ]);

    res.json({ users, total, page: Number(page) || 1, pageSize: take });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(", ")}` });
    }
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "User not found" });
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "User not found" });
    next(err);
  }
}

async function listAgentRuns(req, res, next) {
  try {
    const { page = "1", pageSize = "20", status } = req.query;
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const where = status ? { status } : {};

    const [runs, total] = await Promise.all([
      prisma.agentRun.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { startedAt: "desc" },
        take,
        skip,
      }),
      prisma.agentRun.count({ where }),
    ]);

    res.json({ runs, total, page: Number(page) || 1, pageSize: take });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const [
      sourceGroups,
      totalUsers,
      totalJobListings,
      totalApplications,
      totalMatched,
      totalGeneratedDocuments,
      totalFollowUps,
      sentFollowUps,
      agentRunStatusGroups,
    ] = await Promise.all([
      prisma.jobListing.groupBy({
        by: ["source"],
        _count: { source: true },
        _max: { scrapedAt: true },
      }),
      prisma.user.count(),
      prisma.jobListing.count(),
      prisma.application.count(),
      prisma.application.count({ where: { matchScore: { not: null } } }),
      prisma.generatedDocument.count(),
      prisma.followUp.count(),
      prisma.followUp.count({ where: { sent: true } }),
      prisma.agentRun.groupBy({ by: ["status"], _count: { status: true } }),
    ]);

    const scrapingHealth = sourceGroups.map((g) => ({
      source: g.source,
      count: g._count.source,
      lastScrapedAt: g._max.scrapedAt,
    }));

    const agentRunsByStatus = { RUNNING: 0, SUCCESS: 0, FAILED: 0 };
    for (const g of agentRunStatusGroups) agentRunsByStatus[g.status] = g._count.status;

    res.json({
      scrapingHealth,
      usage: {
        totalUsers,
        totalJobListings,
        totalApplications,
        totalMatched,
        totalGeneratedDocuments,
        totalFollowUps,
        sentFollowUps,
        agentRunsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUserRole, deleteUser, listAgentRuns, getStats };
