const express = require("express");
const {
  createAsset,
  listPublishedAssets,
  listAssetsByOwner,
  getAssetById,
  submitForReview,
  REQUIRED_TAG_TYPES,
  resetAssetsByOwner,
} = require("./assets.service");
const { authenticate, authenticateOptional } = require("../identity/auth.service");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const assets = await listPublishedAssets();
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load assets" });
  }
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    const assets = await listAssetsByOwner(req.user.id);
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load assets" });
  }
});

router.get("/:id", authenticateOptional, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const asset = await getAssetById(assetId);

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    if (asset.status !== "Published") {
      if (!req.user || asset.owner_user_id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to view this asset" });
      }
    }

    return res.json({ asset });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load asset" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, tagIds } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const assetId = await createAsset({
      title: String(title).trim(),
      description: String(description).trim(),
      ownerUserId: req.user.id,
      tagIds: Array.isArray(tagIds)
        ? tagIds.map((id) => Number(id)).filter(Boolean)
        : [],
    });

    return res.status(201).json({ assetId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create asset" });
  }
});

router.post("/:id/submit", authenticate, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    await submitForReview(assetId, req.user.id);
    return res.json({ message: "Asset submitted for review" });
  } catch (err) {
    if (err.missing) {
      const message = `Required metadata missing: ${err.missing.join(", ")}`;
      return res
        .status(err.status || 400)
        .json({ error: message, missing: err.missing, required: REQUIRED_TAG_TYPES });
    }
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/reset", authenticate, async (req, res) => {
  try {
    const deleted = await resetAssetsByOwner(req.user.id);
    return res.json({ message: "Assets cleared", deleted });
  } catch (err) {
    return res.status(500).json({ error: "Failed to reset assets" });
  }
});

module.exports = router;
