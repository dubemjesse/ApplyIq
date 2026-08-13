const { Router } = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const jobRoutes = require("./job.routes");
const applicationRoutes = require("./application.routes");
const documentRoutes = require("./document.routes");
const agentRoutes = require("./agent.routes");
const insightsRoutes = require("./insights.routes");
const adminRoutes = require("./admin.routes");

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok", service: "applyiq-server" }));

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/documents", documentRoutes);
router.use("/agent", agentRoutes);
router.use("/insights", insightsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
