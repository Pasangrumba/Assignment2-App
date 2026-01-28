const { get, run } = require("../../db/db");

const approveAsset = async ({
  assetId,
  actorUserId,
  comments,
  outcome = "Approved",
  issues = [],
}) => {
  const asset = await get(
    "SELECT id, status FROM knowledge_assets WHERE id = ?",
    [assetId]
  );

  if (!asset) {
    const error = new Error("Asset not found");
    error.status = 404;
    throw error;
  }

  if (asset.status !== "PendingReview") {
    const error = new Error("Only PendingReview assets can be approved");
    error.status = 400;
    throw error;
  }

  await run("BEGIN TRANSACTION");
  try {
    await run(
      "UPDATE knowledge_assets SET status = 'Published' WHERE id = ?",
      [assetId]
    );
    await run(
      "INSERT INTO governance_actions (asset_id, action, actor_user_id, comments, outcome, issues, reviewer_user_id) VALUES (?, 'Approved', ?, ?, ?, ?, ?)",
      [
        assetId,
        actorUserId,
        comments || null,
        outcome || "Approved",
        Array.isArray(issues) ? JSON.stringify(issues) : null,
        actorUserId,
      ]
    );

    await run(
      "INSERT INTO integration_events (source_system, payload_hash) VALUES (?, ?)",
      ["governance", `asset:${assetId}:outcome:${outcome}`]
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }

  return true;
};

module.exports = {
  approveAsset,
};
