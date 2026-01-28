const express = require("express");
const { listTags } = require("./tags.service");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const tags = await listTags();
    return res.json({ tags });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load tags" });
  }
});

module.exports = router;
