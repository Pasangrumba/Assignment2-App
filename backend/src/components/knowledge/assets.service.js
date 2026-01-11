const { all, get, run } = require("../../db/db");

const REQUIRED_TAG_TYPES = [
  "Industry",
  "Capability",
  "Region",
  "DeliverableType",
  "AssetType",
  "AccessLevel",
];

const createAsset = async ({
  title,
  description,
  ownerUserId,
  tagIds,
  keywords,
  sourceUrl,
}) => {
  await run("BEGIN TRANSACTION");
  try {
    const assetResult = await run(
      "INSERT INTO knowledge_assets (title, description, status, owner_user_id, keywords, source_url) VALUES (?, ?, 'Draft', ?, ?, ?)",
      [title, description, ownerUserId, keywords || null, sourceUrl || null]
    );

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await run("INSERT INTO asset_tags (asset_id, tag_id) VALUES (?, ?)", [
          assetResult.id,
          tagId,
        ]);
      }
    }

    await run("COMMIT");
    return assetResult.id;
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
};

const listPublishedAssets = async () => {
  const assets = await all(
    "SELECT id, title, description, status, created_at, keywords, source_url FROM knowledge_assets WHERE status = 'Published' ORDER BY created_at DESC"
  );
  return assets;
};

const listAssetsByOwner = async (ownerUserId) => {
  const assets = await all(
    "SELECT id, title, description, status, created_at, keywords, source_url FROM knowledge_assets WHERE owner_user_id = ? ORDER BY created_at DESC",
    [ownerUserId]
  );
  return assets;
};

const getAssetById = async (assetId) => {
  const asset = await get(
    "SELECT id, title, description, status, owner_user_id, created_at, keywords, source_url FROM knowledge_assets WHERE id = ?",
    [assetId]
  );
  if (!asset) {
    return null;
  }

  const tags = await all(
    "SELECT mt.id, mt.tag_type, mt.tag_value FROM metadata_tags mt JOIN asset_tags at ON mt.id = at.tag_id WHERE at.asset_id = ?",
    [assetId]
  );

  return { ...asset, tags };
};

const submitForReview = async (assetId, ownerUserId) => {
  const asset = await get(
    "SELECT id, status, owner_user_id FROM knowledge_assets WHERE id = ?",
    [assetId]
  );

  if (!asset) {
    const error = new Error("Asset not found");
    error.status = 404;
    throw error;
  }

  if (asset.owner_user_id !== ownerUserId) {
    const error = new Error("Not allowed to submit this asset");
    error.status = 403;
    throw error;
  }

  if (asset.status !== "Draft") {
    const error = new Error("Only Draft assets can be submitted");
    error.status = 400;
    throw error;
  }

  const tagTypes = await all(
    "SELECT DISTINCT mt.tag_type FROM metadata_tags mt JOIN asset_tags at ON mt.id = at.tag_id WHERE at.asset_id = ?",
    [assetId]
  );

  const tagTypeSet = new Set(tagTypes.map((row) => row.tag_type));
  const missing = REQUIRED_TAG_TYPES.filter((type) => !tagTypeSet.has(type));

  if (missing.length > 0) {
    const error = new Error("Required metadata missing");
    error.status = 400;
    error.missing = missing;
    throw error;
  }

  await run(
    "UPDATE knowledge_assets SET status = 'PendingReview' WHERE id = ?",
    [assetId]
  );

  return true;
};

const deleteDraft = async (assetId, ownerUserId) => {
  const asset = await get(
    "SELECT id, status, owner_user_id FROM knowledge_assets WHERE id = ?",
    [assetId]
  );

  if (!asset) {
    const error = new Error("Asset not found");
    error.status = 404;
    throw error;
  }

  if (asset.owner_user_id !== ownerUserId) {
    const error = new Error("Not allowed to delete this asset");
    error.status = 403;
    throw error;
  }

  if (asset.status !== "Draft") {
    const error = new Error("Only Draft assets can be deleted");
    error.status = 400;
    throw error;
  }

  await run("DELETE FROM knowledge_assets WHERE id = ?", [assetId]);
  return true;
};

const updateDraft = async ({
  assetId,
  ownerUserId,
  title,
  description,
  tagIds,
  keywords,
  sourceUrl,
}) => {
  await run("BEGIN TRANSACTION");
  try {
    const asset = await get(
      "SELECT id, status, owner_user_id FROM knowledge_assets WHERE id = ?",
      [assetId]
    );

    if (!asset) {
      const error = new Error("Asset not found");
      error.status = 404;
      throw error;
    }

    if (asset.owner_user_id !== ownerUserId) {
      const error = new Error("Not allowed to update this asset");
      error.status = 403;
      throw error;
    }

    if (asset.status !== "Draft") {
      const error = new Error("Only Draft assets can be updated");
      error.status = 400;
      throw error;
    }

    await run(
      "UPDATE knowledge_assets SET title = ?, description = ?, keywords = ?, source_url = ? WHERE id = ?",
      [title, description, keywords || null, sourceUrl || null, assetId]
    );

    await run("DELETE FROM asset_tags WHERE asset_id = ?", [assetId]);

    if (Array.isArray(tagIds) && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await run("INSERT INTO asset_tags (asset_id, tag_id) VALUES (?, ?)", [
          assetId,
          tagId,
        ]);
      }
    }

    await run("COMMIT");
    return true;
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
};

const resetAssetsByOwner = async (ownerUserId) => {
  const result = await run(
    "DELETE FROM knowledge_assets WHERE owner_user_id = ?",
    [ownerUserId]
  );
  return result.changes;
};

module.exports = {
  REQUIRED_TAG_TYPES,
  createAsset,
  listPublishedAssets,
  listAssetsByOwner,
  getAssetById,
  submitForReview,
  deleteDraft,
  updateDraft,
  resetAssetsByOwner,
};
