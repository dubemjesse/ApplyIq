// Client-side derivations for the dashboard. Everything here is computed from
// the existing /insights, /applications and /agent/runs responses — no extra
// endpoints — so the dashboard stays a pure read of what the API already gives.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function longDate(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(value) {
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Pipeline counts + conversion rates from insights.totals.
export function computeFunnel(totals = {}) {
  const saved = totals.SAVED ?? 0;
  const applied = totals.APPLIED ?? 0;
  const interview = totals.INTERVIEW ?? 0;
  const offer = totals.OFFER ?? 0;
  const rejected = totals.REJECTED ?? 0;

  const inPipeline = saved + applied + interview + offer;
  const everApplied = applied + interview + offer + rejected;
  const responded = interview + offer;

  return {
    saved,
    applied,
    interview,
    offer,
    rejected,
    inPipeline,
    everApplied,
    interviewRate: everApplied ? Math.round((responded / everApplied) * 100) : 0,
    replyToInterview: everApplied ? Math.round((responded / everApplied) * 100) : 0,
    interviewToOffer: interview + offer ? Math.round((offer / (interview + offer)) * 100) : 0,
  };
}

// Weekly application volume (sum of all stages entering the tracker that week).
export function weeklyVolume(weeklyBreakdown = []) {
  return weeklyBreakdown.map((w) => ({
    week: w.week,
    total: (w.SAVED ?? 0) + (w.APPLIED ?? 0) + (w.INTERVIEW ?? 0) + (w.OFFER ?? 0) + (w.REJECTED ?? 0),
    interviewsOrOffers: (w.INTERVIEW ?? 0) + (w.OFFER ?? 0),
  }));
}

// The "Needs your attention" items, most urgent first, capped at 3.
export function buildAttention(applications = []) {
  const now = Date.now();
  const withJob = applications.filter((a) => a.job);
  const items = [];

  const offers = withJob.filter((a) => a.status === "OFFER");
  if (offers.length) {
    items.push({
      key: "offer",
      tone: "positive",
      title:
        offers.length === 1
          ? `Offer from ${offers[0].job.company}`
          : `${offers.length} offers on the table`,
      meta: "Review the terms and respond",
      to: "/applications",
    });
  }

  const interviews = withJob.filter((a) => a.status === "INTERVIEW");
  if (interviews.length) {
    const names = interviews.slice(0, 2).map((a) => a.job.company).join(", ");
    items.push({
      key: "interview",
      tone: "interview",
      title: `${interviews.length} interview${interviews.length > 1 ? "s" : ""} in progress`,
      meta: names + (interviews.length > 2 ? ` +${interviews.length - 2} more` : ""),
      to: "/applications",
    });
  }

  const stale = withJob.filter((a) => {
    if (a.status !== "APPLIED") return false;
    const t = new Date(a.appliedAt ?? a.updatedAt).getTime();
    return now - t > WEEK_MS;
  });
  if (stale.length) {
    items.push({
      key: "followup",
      tone: "warn",
      title: `${stale.length} follow-up${stale.length > 1 ? "s" : ""} worth sending`,
      meta: "Applied 7+ days ago, still no reply",
      to: "/applications",
    });
  }

  const strong = withJob.filter((a) => (a.matchScore ?? 0) >= 85 && a.status === "SAVED");
  if (strong.length) {
    items.push({
      key: "match",
      tone: "accent",
      title: `${strong.length} strong match${strong.length > 1 ? "es" : ""} to act on`,
      meta: "Scored 85+ and saved — generate a CV and apply",
      to: "/applications",
    });
  }

  return items.slice(0, 3);
}

// Applications that entered the tracker within the last `days` days.
export function recentlyAdded(applications = [], days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return applications.filter((a) => new Date(a.createdAt).getTime() >= cutoff).length;
}

// Highest-scoring matched roles the user hasn't applied to yet.
export function topMatches(applications = [], limit = 4) {
  return applications
    .filter((a) => a.job && a.matchScore != null && a.status !== "APPLIED" && a.status !== "REJECTED")
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
