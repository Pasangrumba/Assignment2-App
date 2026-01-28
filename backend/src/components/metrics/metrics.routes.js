const express = require("express");
const { authenticate } = require("../identity/auth.service");
const requireRole = require("../../middleware/requireRole");
const { getAdoptionMetrics } = require("./metrics.service");

const router = express.Router();

router.get("/adoption", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const { from, to } = req.query || {};
    const metrics = await getAdoptionMetrics({ from, to });
    return res.json(metrics);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load metrics" });
  }
});

module.exports = router;
