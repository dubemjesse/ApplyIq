const Anthropic = require("@anthropic-ai/sdk");

let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error("ANTHROPIC_API_KEY is not set — AI job matching is unavailable");
    err.status = 503;
    throw err;
  }
  client ??= new Anthropic();
  return client;
}

const MATCH_SCHEMA = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      description: "Overall match percentage from 0-100",
    },
    reasoning: {
      type: "string",
      description: "2-4 sentences explaining the score, referencing specific overlaps or gaps",
    },
    skillGaps: {
      type: "array",
      items: { type: "string" },
      description: "Skills/qualifications the job asks for that the candidate's profile doesn't show",
    },
  },
  required: ["score", "reasoning", "skillGaps"],
  additionalProperties: false,
};

function buildPrompt(userProfile, jobListing) {
  const preferences = userProfile.preferences || {};
  return `Compare this candidate against this job listing and score the match.

CANDIDATE PROFILE
Skills: ${(userProfile.skills || []).join(", ") || "(none listed)"}
Target roles: ${(preferences.targetRoles || []).join(", ") || "(none listed)"}
Experience level: ${preferences.experienceLevel || "(unspecified)"}
Resume summary: ${userProfile.resumeStructured?.summary || "(no resume uploaded)"}
Resume experience: ${(userProfile.resumeStructured?.experience || []).join(" | ") || "(none)"}

JOB LISTING
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || "(unspecified)"}
Description:
${jobListing.description.slice(0, 6000)}

Score how well this candidate fits this specific role from 0-100, explain why, and list concrete skill gaps.`;
}

/**
 * @param {object} userProfile - { skills, preferences, resumeStructured }
 * @param {object} jobListing - { title, company, location, description }
 * @returns {Promise<{ score: number, reasoning: string, skillGaps: string[] }>}
 */
async function matchJobToProfile(userProfile, jobListing) {
  const response = await getClient().messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: { format: { type: "json_schema", schema: MATCH_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(userProfile, jobListing) }],
  });

  if (response.stop_reason === "refusal") {
    const err = new Error("Job matching request was declined");
    err.status = 502;
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    const err = new Error("No match result returned from AI matching service");
    err.status = 502;
    throw err;
  }

  return JSON.parse(textBlock.text);
}

module.exports = { matchJobToProfile };
