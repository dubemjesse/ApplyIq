const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getProfile, updateProfile, uploadResume } = require("../controllers/user.controller");

const router = Router();

router.use(requireAuth);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.post("/me/resume", upload.single("resume"), uploadResume);

module.exports = router;
