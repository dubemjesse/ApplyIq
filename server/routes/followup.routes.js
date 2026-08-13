const { Router } = require("express");
const { listFollowUps, createFollowUp, sendNow, cancelFollowUp } = require("../controllers/followup.controller");

// mergeParams so :id (the application id) from the parent router is visible here.
const router = Router({ mergeParams: true });

router.get("/", listFollowUps);
router.post("/", createFollowUp);
router.post("/:followUpId/send-now", sendNow);
router.delete("/:followUpId", cancelFollowUp);

module.exports = router;
