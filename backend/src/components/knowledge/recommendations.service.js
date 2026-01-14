const { all, run } = require("../../db/db");

const buildScore = (position) => {
  const base = Math.max(0.5, 0.95 - position * 0.08);
  return Number((base + Math.random() * 0.1).toFixed(2));
};

const getRecommendations = async (workspaceId = null) => {
  const params = [];
  let sql = `
    SELECT ka.id, ka.title, ka.description, ka.asset_type, ka.confidentiality, ka.workspace_id, ws.name AS workspace_name
    FROM knowledge_assets ka
    LEFT JOIN workspaces ws ON ws.id = ka.workspace_id
    WHERE ka.status = 'published'
  `;

  if (workspaceId) {
    sql += " AND ka.workspace_id = ?";
    params.push(workspaceId);
  }

  sql += " ORDER BY ka.created_at DESC LIMIT 8";

  const assets = await all(sql, params);
  const generatedOn = new Date().toISOString();

  const recommendations = [];
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    const score = buildScore(index);
    const explanation = asset.asset_type
      ? `High relevance for ${asset.asset_type} assets in ${asset.workspace_name || "workspace"}.`
      : `Popular published asset in ${asset.workspace_name || "workspace"}.`;

    const result = await run(
      "INSERT INTO recommendations (asset_id, recommendation_score, explanation, generated_on) VALUES (?, ?, ?, ?)",
      [asset.id, score, explanation, generatedOn]
    );

    recommendations.push({
      recommendationId: result.id,
      assetId: asset.id,
      title: asset.title,
      description: asset.description,
      score,
      explanation,
      generatedOn,
      workspaceId: asset.workspace_id,
      workspaceName: asset.workspace_name,
    });
  }

  return recommendations;
};

module.exports = {
  getRecommendations,
};
