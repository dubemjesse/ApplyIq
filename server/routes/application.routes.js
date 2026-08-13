const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/application.controller");
const followupRoutes = require("./followup.routes");

const router = Router();

router.use(requireAuth);

router.get("/", listApplications);
router.post("/", createApplication);
router.patch("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.use("/:id/followups", followupRoutes);

module.exports = router;
