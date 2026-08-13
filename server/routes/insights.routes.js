const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getInsights } = require("../controllers/insights.controller");

const router = Router();

router.use(requireAuth);

router.get("/", getInsights);

module.exports = router;
