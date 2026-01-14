const { all, get, run } = require("../../db/db");

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

  if (asset.status !== "pending_review") {
    const error = new Error("Only PendingReview assets can be approved");
    error.status = 400;
    throw error;
  }

  await run("BEGIN TRANSACTION");
  try {
    await run(
      "UPDATE knowledge_assets SET status = 'published' WHERE id = ?",
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

const listPendingReviewAssets = async (workspaceId = null) => {
  const params = [];
  let sql = `SELECT ka.id, ka.title, ka.description, ka.status, ka.created_at,
            ka.owner_user_id, u.name as owner_name, u.email as owner_email
     FROM knowledge_assets ka
     JOIN users u ON u.id = ka.owner_user_id
     WHERE ka.status = 'pending_review'`;

  if (workspaceId) {
    sql += ' AND ka.workspace_id = ?';
    params.push(workspaceId);
  }

  sql += ' ORDER BY ka.created_at DESC';

  const assets = await all(sql, params);
  return assets;
};

const rejectAsset = async ({ assetId, actorUserId, reviewComment }) => {
  const asset = await get(
    "SELECT id, status FROM knowledge_assets WHERE id = ?",
    [assetId]
  );

  if (!asset) {
    const error = new Error("Asset not found");
    error.status = 404;
    throw error;
  }

  if (asset.status !== "pending_review") {
    const error = new Error("Asset is not pending review");
    error.status = 400;
    throw error;
  }

  try {
    await run("BEGIN");
    await run(
      "INSERT INTO governance_actions (asset_id, action, actor_user_id, comments, outcome, reviewer_user_id) VALUES (?, 'Rejected', ?, ?, ?, ?)",
      [
        assetId,
        actorUserId,
        reviewComment || null,
        "Rejected",
        actorUserId,
      ]
    );

    await run(
      "UPDATE knowledge_assets SET status = 'rejected', review_comment = ? WHERE id = ?",
      [reviewComment || null, assetId]
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
  listPendingReviewAssets,
  rejectAsset,
};
