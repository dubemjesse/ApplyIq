const Anthropic = require("@anthropic-ai/sdk");

let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error("ANTHROPIC_API_KEY is not set — AI follow-up drafting is unavailable");
    err.status = 503;
    throw err;
  }
  client ??= new Anthropic();
  return client;
}

const FOLLOWUP_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "A short, professional email subject line" },
    body: {
      type: "string",
      description: "A brief, polite follow-up email body (3-5 short paragraphs), plain text, no markdown",
    },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

function buildPrompt(application) {
  const daysSinceApplied = application.appliedAt
    ? Math.max(0, Math.round((Date.now() - new Date(application.appliedAt).getTime()) / 86400000))
    : null;

  return `Draft a follow-up email for this job application.

Candidate name: ${application.user?.name || "(unknown)"}
Role: ${application.job.title}
Company: ${application.job.company}
Current pipeline stage: ${application.status}
${application.appliedAt ? `Days since applying: ${daysSinceApplied}` : "Not yet marked as applied"}
${application.contactName ? `Hiring contact: ${application.contactName}` : "No specific contact on file — address generically"}
${application.notes ? `Candidate's notes: ${application.notes}` : ""}

Write a brief, warm, professional follow-up checking on the status of the application and
reaffirming interest in the role. Do not be pushy or overly long. No markdown formatting.`;
}

/**
 * @param {object} application - Prisma Application with `job` and `user` included
 * @returns {Promise<{ subject: string, body: string }>}
 */
async function draftFollowUp(application) {
  const response = await getClient().messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: { format: { type: "json_schema", schema: FOLLOWUP_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(application) }],
  });

  if (response.stop_reason === "refusal") {
    const err = new Error("Follow-up drafting request was declined");
    err.status = 502;
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    const err = new Error("No follow-up content returned from AI drafting service");
    err.status = 502;
    throw err;
  }

  return JSON.parse(textBlock.text);
}

module.exports = { draftFollowUp };
