const { all, get, run } = require("../../db/db");

const listChampions = async (region = null) => {
  const params = [];
  let sql = `SELECT ca.id, ca.region, u.id as user_id, u.name, u.email, u.role
             FROM champion_assignments ca
             JOIN users u ON u.id = ca.champion_user_id`;
  if (region) {
    sql += " WHERE lower(ca.region) = lower(?)";
    params.push(region);
  }
  sql += " ORDER BY ca.created_at DESC";
  return all(sql, params);
};

const assignChampion = async ({ championUserId, region }) => {
  const user = await get("SELECT id FROM users WHERE id = ?", [championUserId]);
  if (!user) {
    const error = new Error("Champion user not found");
    error.status = 404;
    throw error;
  }

  await run("BEGIN");
  try {
    await run("UPDATE users SET role = 'champion' WHERE id = ?", [championUserId]);
    await run(
      "INSERT INTO champion_assignments (champion_user_id, region) VALUES (?, ?)",
      [championUserId, region]
    );
    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }

  return true;
};

module.exports = {
  listChampions,
  assignChampion,
};
