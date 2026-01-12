const { all } = require("../../db/db");

const listWorkspaces = async () => {
  const workspaces = await all(
    "SELECT id, name, related_project_id FROM workspaces ORDER BY name"
  );
  return workspaces;
};

module.exports = {
  listWorkspaces,
};
