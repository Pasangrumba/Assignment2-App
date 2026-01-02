const fs = require("fs");
const path = require("path");

const dbPath = path.resolve(__dirname, "..", "..", "mwcd_coursework2.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Deleted existing mwcd_coursework2.db");
}

require("./db");

console.log("Database reset and schema reloaded.");
