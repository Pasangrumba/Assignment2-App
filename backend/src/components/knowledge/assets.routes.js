const express = require("express");
const {
  createAsset,
  listPublishedAssets,
  searchAssets,
  listAssetsByOwner,
  getAssetById,
  submitForReview,
  REQUIRED_TAG_TYPES,
  deleteDraft,
  updateDraft,
  resetAssetsByOwner,
} = require("./assets.service");
const { authenticate, authenticateOptional } = require("../identity/auth.service");
const { trackEvent } = require("../metrics/usage.service");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const assets = await listPublishedAssets();
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load assets" });
  }
});

router.get("/search", authenticateOptional, async (req, res) => {
  try {
    const query = req.query.q ? String(req.query.q) : "";
    const assets = await searchAssets(query);
    await trackEvent(req, "SEARCH", null, { query });
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to search assets" });
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

    if (asset.status !== "published") {
      if (asset.status === "needs_review" || asset.status === "expired") {
        await trackEvent(req, "VIEW", assetId);
        return res.json({ asset });
      }
      if (!req.user || asset.owner_user_id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to view this asset" });
      }
    }

    await trackEvent(req, "VIEW", assetId);
    return res.json({ asset });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load asset" });
  }
});

router.get("/:id/download", authenticateOptional, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const asset = await getAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }
    if (asset.status !== "published") {
      if (asset.status === "needs_review" || asset.status === "expired") {
        await trackEvent(req, "DOWNLOAD", assetId);
        return res.json({ asset, message: "Download ready" });
      }
      if (!req.user || asset.owner_user_id !== req.user.id) {
        return res.status(403).json({ error: "Not allowed to download this asset" });
      }
    }
    await trackEvent(req, "DOWNLOAD", assetId);
    return res.json({ asset, message: "Download ready" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to download asset" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      tagIds,
      keywords,
      sourceUrl,
      assetType,
      confidentiality,
      sourceProjectId,
      workspaceId,
      versionMajor,
      versionMinor,
    } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const parsedVersionMajor = Number(versionMajor);
    const parsedVersionMinor = Number(versionMinor);

    const assetId = await createAsset({
      title: String(title).trim(),
      description: String(description).trim(),
      ownerUserId: req.user.id,
      tagIds: Array.isArray(tagIds)
        ? tagIds.map((id) => Number(id)).filter(Boolean)
        : [],
      keywords: keywords ? String(keywords).trim() : null,
      sourceUrl: sourceUrl ? String(sourceUrl).trim() : null,
      assetType: assetType ? String(assetType).trim() : null,
      confidentiality: confidentiality ? String(confidentiality).trim() : null,
      sourceProjectId: sourceProjectId ? String(sourceProjectId).trim() : null,
      workspaceId: workspaceId ? Number(workspaceId) : null,
      versionMajor: Number.isFinite(parsedVersionMajor) ? parsedVersionMajor : 1,
      versionMinor: Number.isFinite(parsedVersionMinor) ? parsedVersionMinor : 0,
    });

    await trackEvent(req, "CREATE", assetId);
    return res.status(201).json({ assetId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create asset" });
  }
});

router.put("/:id/submit", authenticate, async (req, res) => {
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

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    await deleteDraft(assetId, req.user.id);
    return res.json({ message: "Draft deleted" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const {
      title,
      description,
      tagIds,
      keywords,
      sourceUrl,
      assetType,
      confidentiality,
      sourceProjectId,
      workspaceId,
      versionMajor,
      versionMinor,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const normalizedTagIds = Array.isArray(tagIds)
      ? tagIds.map((id) => Number(id)).filter(Boolean)
      : [];

    const parsedVersionMajor = Number(versionMajor);
    const parsedVersionMinor = Number(versionMinor);

    await updateDraft({
      assetId,
      ownerUserId: req.user.id,
      title: String(title).trim(),
      description: String(description).trim(),
      tagIds: normalizedTagIds,
      keywords: keywords ? String(keywords).trim() : null,
      sourceUrl: sourceUrl ? String(sourceUrl).trim() : null,
      assetType: assetType ? String(assetType).trim() : null,
      confidentiality: confidentiality ? String(confidentiality).trim() : null,
      sourceProjectId: sourceProjectId ? String(sourceProjectId).trim() : null,
      workspaceId: workspaceId ? Number(workspaceId) : null,
      versionMajor: Number.isFinite(parsedVersionMajor) ? parsedVersionMajor : 1,
      versionMinor: Number.isFinite(parsedVersionMinor) ? parsedVersionMinor : 0,
    });

    return res.json({ message: "Draft updated" });
  } catch (err) {
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
