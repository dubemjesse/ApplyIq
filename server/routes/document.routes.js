const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { generate, listForJob, download } = require("../controllers/document.controller");

const router = Router();

router.use(requireAuth);

router.post("/generate", generate);
router.get("/", listForJob);
router.get("/:id/download", download);

module.exports = router;
