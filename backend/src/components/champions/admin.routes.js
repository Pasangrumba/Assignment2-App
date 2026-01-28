const express = require("express");
const { assignChampion } = require("./champions.service");
const { authenticate } = require("../identity/auth.service");
const requireRole = require("../../middleware/requireRole");

const router = express.Router();

router.post("/champions/assign", authenticate, requireRole(["admin"]), async (req, res) => {
  try {
    const { champion_user_id, region } = req.body || {};
    if (!champion_user_id || !region) {
      return res.status(400).json({ error: "champion_user_id and region are required" });
    }
    await assignChampion({
      championUserId: Number(champion_user_id),
      region: String(region).trim(),
    });
    return res.json({ message: "Champion assigned" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
