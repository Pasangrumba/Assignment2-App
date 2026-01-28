const cron = require("node-cron");
const { all, run } = require("../db/db");

const markNeedsReview = async () => {
  const assets = await all(
    "SELECT id FROM knowledge_assets WHERE status = 'published' AND review_due_at IS NOT NULL AND review_due_at < CURRENT_TIMESTAMP"
  );

  for (const asset of assets) {
    await run(
      "UPDATE knowledge_assets SET status = 'needs_review' WHERE id = ?",
      [asset.id]
    );
    await run(
      "INSERT INTO audit_logs (actor_user_id, action, content_id, notes) VALUES (?, ?, ?, ?)",
      [0, "MARK_NEEDS_REVIEW", asset.id, "Auto-marked by scheduler"]
    );
  }
};

const markExpired = async () => {
  const assets = await all(
    "SELECT id FROM knowledge_assets WHERE status IN ('published','needs_review') AND expiry_at IS NOT NULL AND expiry_at < CURRENT_TIMESTAMP"
  );

  for (const asset of assets) {
    await run("UPDATE knowledge_assets SET status = 'expired' WHERE id = ?", [
      asset.id,
    ]);
    await run(
      "INSERT INTO audit_logs (actor_user_id, action, content_id, notes) VALUES (?, ?, ?, ?)",
      [0, "EXPIRE", asset.id, "Auto-expired by scheduler"]
    );
  }
};

const runGovernanceLifecycle = async () => {
  try {
    await markNeedsReview();
    await markExpired();
  } catch (err) {
    console.error("Governance scheduler failed", err);
  }
};

const startGovernanceScheduler = () => {
  cron.schedule("0 2 * * *", () => {
    runGovernanceLifecycle();
  });
};

module.exports = {
  startGovernanceScheduler,
  runGovernanceLifecycle,
};
