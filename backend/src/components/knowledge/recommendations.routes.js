const express = require("express");
const { getRecommendations } = require("./recommendations.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId
      ? Number(req.query.workspaceId)
      : null;
    const recommendations = await getRecommendations(workspaceId || null);
    return res.json({ recommendations });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load recommendations" });
  }
});

module.exports = router;
