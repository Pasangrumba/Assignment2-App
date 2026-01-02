const { get, run } = require("../../db/db");

const approveAsset = async ({ assetId, actorUserId, comments }) => {
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
      "INSERT INTO governance_actions (asset_id, action, actor_user_id, comments) VALUES (?, 'Approved', ?, ?)",
      [assetId, actorUserId, comments || null]
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
