const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.resolve(__dirname, "..", "..", "mwcd_coursework2.db");
const schemaPath = path.resolve(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath);

const addColumnIfMissing = (table, column, definition) =>
  new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const exists = rows.some((row) => row.name === column);
      if (exists) {
        resolve(false);
        return;
      }
      db.run(`ALTER TABLE ${table} ADD COLUMN ${definition}`, (alterErr) => {
        if (alterErr) {
          reject(alterErr);
          return;
        }
        resolve(true);
      });
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });



db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  // Lightweight migrations for existing databases to align with the DKN model
  Promise.all([
    addColumnIfMissing("users", "role", "role TEXT"),
    addColumnIfMissing("users", "region", "region TEXT"),
    addColumnIfMissing("users", "languages", "languages TEXT"),
    addColumnIfMissing("users", "availability", "availability TEXT"),
    addColumnIfMissing("knowledge_assets", "asset_type", "asset_type TEXT"),
    addColumnIfMissing(
      "knowledge_assets",
      "confidentiality",
      "confidentiality TEXT"
    ),
    addColumnIfMissing(
      "knowledge_assets",
      "source_project_id",
      "source_project_id TEXT"
    ),
    addColumnIfMissing(
      "knowledge_assets",
      "workspace_id",
      "workspace_id INTEGER"
    ),
    addColumnIfMissing(
      "knowledge_assets",
      "version_major",
      "version_major INTEGER NOT NULL DEFAULT 1"
    ),
    addColumnIfMissing(
      "knowledge_assets",
      "version_minor",
      "version_minor INTEGER NOT NULL DEFAULT 0"
    ),
    addColumnIfMissing(
      "knowledge_assets",
      "version_updated_at",
      "version_updated_at TEXT"
    ),
    addColumnIfMissing("governance_actions", "outcome", "outcome TEXT"),
    addColumnIfMissing("governance_actions", "issues", "issues TEXT"),
    addColumnIfMissing(
      "governance_actions",
      "reviewer_user_id",
      "reviewer_user_id INTEGER"
    ),
  ]).then(async () => {
    // Normalize legacy role/status values for consistency
    await run("UPDATE users SET role = 'author' WHERE role IS NULL OR TRIM(role) = ''");
    await run("UPDATE users SET role = lower(role)");
    await run("UPDATE knowledge_assets SET status = lower(status)");
    await run("UPDATE knowledge_assets SET status = 'pending_review' WHERE status IN ('pendingreview')");
  }).catch((err) => {
    console.error("Migration failed", err);
  });
});

module.exports = {
  db,
  run,
  get,
  all,
};
