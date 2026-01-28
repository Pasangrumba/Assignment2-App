const express = require("express");
const { createMentoringRequest, listMentoringInbox, updateMentoringStatus } = require("./mentoring.service");
const { authenticate } = require("../identity/auth.service");
const requireRole = require("../../middleware/requireRole");
const { trackEvent } = require("../metrics/usage.service");

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { champion_user_id, topic, message } = req.body || {};
    if (!champion_user_id || !topic) {
      return res.status(400).json({ error: "champion_user_id and topic are required" });
    }
    const requestId = await createMentoringRequest({
      requesterUserId: req.user.id,
      championUserId: Number(champion_user_id),
      topic: String(topic).trim(),
      message: message ? String(message).trim() : null,
    });
    await trackEvent(req, "CREATE", requestId, { type: "mentoring_request" });
    return res.status(201).json({ requestId });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.get("/inbox", authenticate, requireRole(["champion", "admin"]), async (req, res) => {
  try {
    const requests = await listMentoringInbox(req.user.id);
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load mentoring requests" });
  }
});

router.patch("/:id", authenticate, requireRole(["champion", "admin"]), async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body || {};
    await updateMentoringStatus({
      requestId,
      championUserId: req.user.id,
      status: status ? String(status) : null,
    });
    if (String(status || "").toUpperCase() === "RESOLVED") {
      await trackEvent(req, "APPROVE", requestId, { type: "mentoring_request" });
    }
    return res.json({ message: "Mentoring request updated" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
