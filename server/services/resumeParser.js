const { PDFParse } = require("pdf-parse");

// Section headers we recognize when splitting a resume into structured parts.
// Heuristic only — no AI call involved (that upgrade path is Phase 4/5, once
// matcher.js/generator.js are wired to an LLM anyway).
const SECTION_HEADERS = {
  summary: /^(summary|profile|objective|about)\b/i,
  skills: /^(skills|technical skills|core competencies)\b/i,
  experience: /^(experience|work experience|employment history|professional experience)\b/i,
  education: /^(education|academic background)\b/i,
  certifications: /^(certifications?|licenses?)\b/i,
  projects: /^(projects)\b/i,
};

function splitIntoSections(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const sections = { summary: [], skills: [], experience: [], education: [], certifications: [], projects: [] };
  let current = null;

  for (const line of lines) {
    const matchedSection = Object.entries(SECTION_HEADERS).find(([, pattern]) => pattern.test(line));
    if (matchedSection) {
      current = matchedSection[0];
      continue;
    }
    if (current) {
      sections[current].push(line);
    }
  }

  return sections;
}

function extractSkillList(skillLines) {
  return skillLines
    .flatMap((line) => line.split(/[,•|;]/))
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);
}

/**
 * @param {Buffer} buffer - raw PDF file contents
 * @returns {Promise<{ rawText: string, structured: object }>}
 */
async function parseResumeBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  let rawText;
  try {
    const result = await parser.getText();
    rawText = result.text;
  } finally {
    await parser.destroy();
  }

  const sections = splitIntoSections(rawText);
  const structured = {
    summary: sections.summary.join(" "),
    skills: extractSkillList(sections.skills),
    experience: sections.experience,
    education: sections.education,
    certifications: sections.certifications,
    projects: sections.projects,
  };

  return { rawText, structured };
}

module.exports = { parseResumeBuffer };
