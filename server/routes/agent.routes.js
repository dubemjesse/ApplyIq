const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { runAgent, listRuns } = require("../controllers/agent.controller");

const router = Router();

router.use(requireAuth);

router.post("/run", runAgent);
router.get("/runs", listRuns);

module.exports = router;
