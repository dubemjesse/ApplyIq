const { Router } = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listUsers,
  updateUserRole,
  deleteUser,
  listAgentRuns,
  getStats,
} = require("../controllers/admin.controller");

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/agent-runs", listAgentRuns);
router.get("/stats", getStats);

module.exports = router;
