const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.resolve(__dirname, "..", "..", "mwcd_coursework2.db");

const seedUsers = async (db) => {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Author user
  await db.run(
    "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ["Author User", "author@example.com", passwordHash, "author"]
  );

  // Reviewer user
  await db.run(
    "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ["Reviewer User", "reviewer@example.com", passwordHash, "reviewer"]
  );
};

(async () => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("Deleted existing mwcd_coursework2.db");
  }

  // Initialize DB + schema
  const db = require("./db");

  // Seed demo accounts for governance workflow testing
  try {
    await seedUsers(db);
    console.log("Seeded demo users (author + reviewer).");
  } catch (err) {
    console.error("Failed to seed demo users:", err);
  }

  console.log("Database reset and schema reloaded.");
})();
