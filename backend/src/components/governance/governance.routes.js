const express = require("express");
const { approveAsset } = require("./governance.service");
const { authenticate } = require("../identity/auth.service");

const router = express.Router();

router.post("/assets/:id/approve", authenticate, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const { comments } = req.body;
    await approveAsset({
      assetId,
      actorUserId: req.user.id,
      comments: comments ? String(comments) : null,
    });
    return res.json({ message: "Asset approved and published" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
