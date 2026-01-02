const { all } = require("../../db/db");

const listTags = async () => {
  const tags = await all(
    "SELECT id, tag_type, tag_value FROM metadata_tags ORDER BY tag_type, tag_value"
  );
  return tags;
};

module.exports = {
  listTags,
};
