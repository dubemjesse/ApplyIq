const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { listJobs, triggerScrape, matchJob } = require("../controllers/job.controller");

const router = Router();

router.use(requireAuth);

router.get("/", listJobs);
router.post("/scrape", triggerScrape);
router.post("/:id/match", matchJob);

module.exports = router;
