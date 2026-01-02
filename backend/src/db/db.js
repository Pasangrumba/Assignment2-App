const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.resolve(__dirname, "..", "..", "mwcd_coursework2.db");
const schemaPath = path.resolve(__dirname, "schema.sql");

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
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

module.exports = {
  db,
  run,
  get,
  all,
};
