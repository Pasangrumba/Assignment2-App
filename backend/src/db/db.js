const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(process.cwd(), "mwcd_coursework2.db");
const dbDir = path.dirname(dbPath);
fs.mkdirSync(dbDir, { recursive: true });
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

const seedIfEmpty = async () => {
  const existing = await get("SELECT COUNT(*) as count FROM users");
  if (existing && existing.count > 0) {
    return;
  }

  const seedPassword = process.env.SEED_REVIEWER_PASSWORD || "admin123";
  const reviewerEmail = process.env.SEED_REVIEWER_EMAIL || "reviewer@test.com";
  const authorEmail = process.env.SEED_AUTHOR_EMAIL || "author@test.com";
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  const authorResult = await run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ["Author User", authorEmail, passwordHash, "author"]
  );

  await run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ["Reviewer User", reviewerEmail, passwordHash, "reviewer"]
  );

  await run("INSERT OR IGNORE INTO expertise_profiles (user_id) VALUES (?)", [
    authorResult.id,
  ]);

  const seededAssets = [
    [
      "Quarterly Insight Report",
      "Sample asset seeded for reviewer workflow testing.",
      "finance,insights,report",
      1,
    ],
    [
      "Client Delivery Playbook",
      "Operational checklist for delivery teams.",
      "delivery,playbook,checklist",
      2,
    ],
    [
      "Innovation Lab Prototype Notes",
      "Exploration notes for early-stage prototype.",
      "innovation,prototype,notes",
      3,
    ],
    [
      "Security Automation Brief",
      "Overview of automation opportunities in security.",
      "security,automation,brief",
      1,
    ],
    [
      "Healthcare Analytics Snapshot",
      "Short insights summary for healthcare analytics.",
      "healthcare,analytics,summary",
      2,
    ],
    [
      "API Delivery Checklist",
      "Checklist to validate API delivery readiness.",
      "api,delivery,checklist",
      2,
    ],
    [
      "Education Data Trends",
      "Key trends in education data programs.",
      "education,data,trends",
      3,
    ],
    [
      "Risk Review Template",
      "Template for structured risk review.",
      "risk,template,review",
      1,
    ],
  ];

  for (const [title, description, keywords, workspaceId] of seededAssets) {
    await run(
      "INSERT INTO knowledge_assets (title, description, status, owner_user_id, keywords, workspace_id) VALUES (?, ?, 'pending_review', ?, ?, ?)",
      [title, description, authorResult.id, keywords, workspaceId]
    );
  }
};


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
    await seedIfEmpty();
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
