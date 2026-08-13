const prisma = require("../utils/prisma");
const { parseResumeBuffer } = require("../services/resumeParser");

const SAFE_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  skills: true,
  experience: true,
  preferences: true,
  resumeStructured: true,
  createdAt: true,
};

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: SAFE_USER_FIELDS,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, skills, experience, preferences } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (skills !== undefined) {
      if (!Array.isArray(skills) || !skills.every((s) => typeof s === "string")) {
        return res.status(400).json({ message: "skills must be an array of strings" });
      }
      data.skills = skills;
    }
    if (experience !== undefined) data.experience = experience;
    if (preferences !== undefined) data.preferences = preferences;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: SAFE_USER_FIELDS,
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded — send a PDF under field name 'resume'" });
    }

    const { rawText, structured } = await parseResumeBuffer(req.file.buffer);

    const existing = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { skills: true },
    });

    const data = {
      resumeRaw: rawText,
      resumeStructured: structured,
    };
    // Only auto-populate skills from the parsed resume if the user hasn't set any yet,
    // so this never clobbers skills the user has already curated by hand.
    if ((existing?.skills?.length ?? 0) === 0 && structured.skills.length > 0) {
      data.skills = structured.skills;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: SAFE_USER_FIELDS,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, uploadResume };
