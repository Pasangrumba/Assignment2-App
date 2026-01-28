const { all, get, run } = require("../../db/db");

const createMentoringRequest = async ({
  requesterUserId,
  championUserId,
  topic,
  message,
}) => {
  const champion = await get("SELECT id FROM users WHERE id = ?", [
    championUserId,
  ]);
  if (!champion) {
    const error = new Error("Champion not found");
    error.status = 404;
    throw error;
  }

  const result = await run(
    "INSERT INTO mentoring_requests (requester_user_id, champion_user_id, topic, message) VALUES (?, ?, ?, ?)",
    [requesterUserId, championUserId, topic, message || null]
  );
  return result.id;
};

const listMentoringInbox = async (championUserId) => {
  return all(
    `SELECT mr.id, mr.requester_user_id, mr.champion_user_id, mr.topic, mr.message, mr.status, mr.created_at, mr.resolved_at,
            u.name as requester_name, u.email as requester_email
     FROM mentoring_requests mr
     JOIN users u ON u.id = mr.requester_user_id
     WHERE mr.champion_user_id = ?
     ORDER BY mr.created_at DESC`,
    [championUserId]
  );
};

const updateMentoringStatus = async ({ requestId, championUserId, status }) => {
  const request = await get(
    "SELECT id, status FROM mentoring_requests WHERE id = ? AND champion_user_id = ?",
    [requestId, championUserId]
  );
  if (!request) {
    const error = new Error("Mentoring request not found");
    error.status = 404;
    throw error;
  }

  const normalized = String(status || "").toUpperCase();
  const allowed = new Set(["OPEN", "IN_PROGRESS", "RESOLVED"]);
  const safeStatus = allowed.has(normalized) ? normalized : "OPEN";

  await run(
    "UPDATE mentoring_requests SET status = ?, resolved_at = CASE WHEN ? = 'RESOLVED' THEN CURRENT_TIMESTAMP ELSE resolved_at END WHERE id = ?",
    [safeStatus, safeStatus, requestId]
  );

  return true;
};

module.exports = {
  createMentoringRequest,
  listMentoringInbox,
  updateMentoringStatus,
};
