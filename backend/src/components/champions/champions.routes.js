const express = require("express");
const { listChampions } = require("./champions.service");
const { authenticateOptional } = require("../identity/auth.service");

const router = express.Router();

router.get("/", authenticateOptional, async (req, res) => {
  try {
    const region = req.query.region ? String(req.query.region) : null;
    const champions = await listChampions(region);
    return res.json({ champions });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load champions" });
  }
});

module.exports = router;
