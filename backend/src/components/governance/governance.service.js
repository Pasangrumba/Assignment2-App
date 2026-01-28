const { all, get, run } = require("../../db/db");

const REVIEW_DUE_DAYS = Number(process.env.REVIEW_DUE_DAYS || 90);
const EXPIRY_DAYS = Number(process.env.EXPIRY_DAYS || 365);

const logAudit = async ({ actorUserId, action, contentId, notes }) => {
  await run(
    "INSERT INTO audit_logs (actor_user_id, action, content_id, notes) VALUES (?, ?, ?, ?)",
    [actorUserId, action, contentId, notes || null]
  );
};

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
      "UPDATE knowledge_assets SET status = 'published', last_reviewed_at = CURRENT_TIMESTAMP, review_due_at = datetime('now', ?), expiry_at = datetime('now', ?) WHERE id = ?",
      [`+${REVIEW_DUE_DAYS} days`, `+${EXPIRY_DAYS} days`, assetId]
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
    await logAudit({
      actorUserId,
      action: "APPROVE",
      contentId: assetId,
      notes: comments || null,
    });

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

const listAssetsByStatus = async (status) => {
  const normalized = String(status || "").toLowerCase();
  const assets = await all(
    `SELECT ka.id, ka.title, ka.description, ka.status, ka.created_at,
            ka.owner_user_id, u.name as owner_name, u.email as owner_email,
            ka.last_reviewed_at, ka.review_due_at, ka.expiry_at
     FROM knowledge_assets ka
     JOIN users u ON u.id = ka.owner_user_id
     WHERE ka.status = ?
     ORDER BY ka.created_at DESC`,
    [normalized]
  );
  return assets;
};

const getAuditLogs = async (assetId) => {
  const logs = await all(
    `SELECT al.id, al.actor_user_id, al.action, al.content_id, al.notes, al.created_at, u.name as actor_name, u.email as actor_email
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.actor_user_id
     WHERE al.content_id = ?
     ORDER BY al.created_at DESC`,
    [assetId]
  );
  return logs;
};

const revalidateAsset = async ({ assetId, actorUserId, notes }) => {
  const asset = await get(
    "SELECT id, status FROM knowledge_assets WHERE id = ?",
    [assetId]
  );

  if (!asset) {
    const error = new Error("Asset not found");
    error.status = 404;
    throw error;
  }

  await run("BEGIN TRANSACTION");
  try {
    await run(
      "UPDATE knowledge_assets SET status = 'published', last_reviewed_at = CURRENT_TIMESTAMP, review_due_at = datetime('now', ?), expiry_at = datetime('now', ?) WHERE id = ?",
      [`+${REVIEW_DUE_DAYS} days`, `+${EXPIRY_DAYS} days`, assetId]
    );
    await logAudit({
      actorUserId,
      action: "REVALIDATE",
      contentId: assetId,
      notes: notes || null,
    });
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }

  return true;
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
    await logAudit({
      actorUserId,
      action: "REJECT",
      contentId: assetId,
      notes: reviewComment || null,
    });

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
  listAssetsByStatus,
  getAuditLogs,
  revalidateAsset,
  rejectAsset,
};
