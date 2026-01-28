const express = require("express");
const { listWorkspaces } = require("./workspaces.service");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const workspaces = await listWorkspaces();
    return res.json({ workspaces });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load workspaces" });
  }
});

module.exports = router;
