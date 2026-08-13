const Anthropic = require("@anthropic-ai/sdk");

let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error("ANTHROPIC_API_KEY is not set — AI document generation is unavailable");
    err.status = 503;
    throw err;
  }
  client ??= new Anthropic();
  return client;
}

const DOCUMENTS_SCHEMA = {
  type: "object",
  properties: {
    cv: {
      type: "string",
      description:
        "A complete, ATS-optimized plain-text CV tailored to this role: name/contact placeholder header, " +
        "professional summary, skills, work experience (reverse-chronological), education. Plain text with " +
        "clear section headings in ALL CAPS, no markdown syntax.",
    },
    coverLetter: {
      type: "string",
      description:
        "A complete, personalized plain-text cover letter (3-4 paragraphs) tailored to this specific role and " +
        "company, professional tone, no markdown syntax.",
    },
  },
  required: ["cv", "coverLetter"],
  additionalProperties: false,
};

function buildPrompt(userProfile, jobListing) {
  const preferences = userProfile.preferences || {};
  return `Write a tailored CV and cover letter for this candidate applying to this specific job.

CANDIDATE PROFILE
Skills: ${(userProfile.skills || []).join(", ") || "(none listed)"}
Target roles: ${(preferences.targetRoles || []).join(", ") || "(none listed)"}
Experience level: ${preferences.experienceLevel || "(unspecified)"}
Resume summary: ${userProfile.resumeStructured?.summary || "(no resume uploaded)"}
Resume experience: ${(userProfile.resumeStructured?.experience || []).join(" | ") || "(none)"}
Resume education: ${(userProfile.resumeStructured?.education || []).join(" | ") || "(none)"}

JOB LISTING
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || "(unspecified)"}
Description:
${jobListing.description.slice(0, 6000)}

Requirements:
- Rephrase and emphasize the candidate's genuinely relevant experience — never copy sentences from the job description verbatim.
- Professional, ATS-optimized tone. No markdown formatting (no #, *, backticks).
- If the candidate's profile is thin, write honestly from what's given rather than inventing experience or credentials.`;
}

/**
 * @param {object} userProfile - { skills, preferences, resumeStructured }
 * @param {object} jobListing - { title, company, location, description }
 * @returns {Promise<{ cv: string, coverLetter: string }>}
 */
async function generateDocuments(userProfile, jobListing) {
  const response = await getClient().messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    output_config: { format: { type: "json_schema", schema: DOCUMENTS_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(userProfile, jobListing) }],
  });

  if (response.stop_reason === "refusal") {
    const err = new Error("Document generation request was declined");
    err.status = 502;
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    const err = new Error("No document content returned from AI generation service");
    err.status = 502;
    throw err;
  }

  return JSON.parse(textBlock.text);
}

module.exports = { generateDocuments };
