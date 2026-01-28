const express = require("express");
const { approveAsset, listPendingReviewAssets, listAssetsByStatus, getAuditLogs, revalidateAsset, rejectAsset } = require("./governance.service");
const { submitForReview } = require("../knowledge/assets.service");
const { authenticate } = require("../identity/auth.service");
const requireRole = require("../../middleware/requireRole");
const { trackEvent } = require("../metrics/usage.service");

const router = express.Router();

// Author submits their own draft for review (draft -> pending_review)
router.put("/assets/:id/submit", authenticate, async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    await submitForReview(assetId, req.user.id);
    return res.json({ message: "Asset submitted for review" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// Reviewer/Admin list all assets pending review
router.get("/pending", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId ? Number(req.query.workspaceId) : null;
    const assets = await listPendingReviewAssets(workspaceId);
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load pending assets" });
  }
});

router.get("/status", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : "needs_review";
    const assets = await listAssetsByStatus(status);
    return res.json({ assets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load assets" });
  }
});

router.get("/assets/:id/audit", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const logs = await getAuditLogs(assetId);
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load audit logs" });
  }
});

router.post("/:id/revalidate", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const { notes } = req.body || {};
    await revalidateAsset({
      assetId,
      actorUserId: req.user.id,
      notes: notes ? String(notes) : null,
    });
    return res.json({ message: "Asset revalidated" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// Reviewer/Admin approves pending asset (pending_review -> published)
router.put("/assets/:id/approve", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const { comments, outcome, issues } = req.body || {};
    await approveAsset({
      assetId,
      actorUserId: req.user.id,
      comments: comments ? String(comments) : null,
      outcome: outcome ? String(outcome) : "Approved",
      issues: Array.isArray(issues) ? issues.map(String) : [],
    });
    await trackEvent(req, "APPROVE", assetId);
    return res.json({ message: "Asset approved and published" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// Reviewer/Admin rejects pending asset (pending_review -> rejected)
router.put("/assets/:id/reject", authenticate, requireRole(["reviewer", "admin"]), async (req, res) => {
  try {
    const assetId = Number(req.params.id);
    const { review_comment } = req.body || {};
    await rejectAsset({
      assetId,
      actorUserId: req.user.id,
      reviewComment: review_comment ? String(review_comment) : null,
    });
    return res.json({ message: "Asset rejected" });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
