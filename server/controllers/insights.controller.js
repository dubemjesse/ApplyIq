const prisma = require("../utils/prisma");

const STATUS_ORDER = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const WEEKS_TO_SHOW = 8;

// ISO 8601 week key, e.g. "2026-W29".
function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function lastNWeekKeys(n) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    keys.push(isoWeekKey(d));
  }
  return [...new Set(keys)];
}

async function getInsights(req, res, next) {
  try {
    const userId = req.user.id;

    const [applications, totalJobsInDb, statusCounts] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        select: { status: true, createdAt: true, skillGaps: true },
      }),
      prisma.jobListing.count(),
      prisma.application.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      }),
    ]);

    const totals = { totalApplications: applications.length, totalJobsInDb };
    for (const status of STATUS_ORDER) totals[status] = 0;
    for (const row of statusCounts) totals[row.status] = row._count;

    // Weekly breakdown: bucket applications by the week they entered the
    // tracker, broken down by their *current* status (we don't track full
    // status-transition history, so this reflects present state, not the
    // status at the time).
    const weekKeys = lastNWeekKeys(WEEKS_TO_SHOW);
    const weekBuckets = new Map(weekKeys.map((k) => [k, { week: k, SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 }]));
    for (const app of applications) {
      const key = isoWeekKey(new Date(app.createdAt));
      const bucket = weekBuckets.get(key);
      if (bucket) bucket[app.status] += 1;
    }
    const weeklyBreakdown = weekKeys.map((k) => weekBuckets.get(k));

    // Skill gap frequency across all matched applications.
    const skillGapCounts = new Map();
    for (const app of applications) {
      for (const skill of app.skillGaps) {
        skillGapCounts.set(skill, (skillGapCounts.get(skill) || 0) + 1);
      }
    }
    const skillGaps = [...skillGapCounts.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Most active hiring companies across all scraped listings (global, not
    // scoped to this user's applications — reflects overall scrape coverage).
    const companyGroups = await prisma.jobListing.groupBy({
      by: ["company"],
      _count: { company: true },
      orderBy: { _count: { company: "desc" } },
      take: 10,
    });
    const topCompanies = companyGroups.map((c) => ({ company: c.company, count: c._count.company }));

    // Weekly performance summary: this week vs the prior week.
    const thisWeekKey = weekKeys[weekKeys.length - 1];
    const lastWeekKey = weekKeys[weekKeys.length - 2];
    const thisWeek = weekBuckets.get(thisWeekKey);
    const lastWeek = lastWeekKey ? weekBuckets.get(lastWeekKey) : null;
    const sumStages = (b) => (b ? STATUS_ORDER.reduce((sum, s) => sum + b[s], 0) : 0);
    const weeklySummary = {
      thisWeekTotal: sumStages(thisWeek),
      lastWeekTotal: sumStages(lastWeek),
      thisWeekInterviewsOrOffers: thisWeek ? thisWeek.INTERVIEW + thisWeek.OFFER : 0,
      lastWeekInterviewsOrOffers: lastWeek ? lastWeek.INTERVIEW + lastWeek.OFFER : 0,
    };

    res.json({ totals, weeklyBreakdown, skillGaps, topCompanies, weeklySummary });
  } catch (err) {
    next(err);
  }
}

module.exports = { getInsights };
