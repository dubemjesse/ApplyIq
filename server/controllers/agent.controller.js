const prisma = require("../utils/prisma");
const { runAgentForUser } = require("../services/agent");

async function runAgent(req, res, next) {
  try {
    const run = await runAgentForUser(req.user.id);
    res.status(201).json({ run });
  } catch (err) {
    next(err);
  }
}

async function listRuns(req, res, next) {
  try {
    const runs = await prisma.agentRun.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: "desc" },
      take: 20,
    });
    res.json({ runs });
  } catch (err) {
    next(err);
  }
}

module.exports = { runAgent, listRuns };
