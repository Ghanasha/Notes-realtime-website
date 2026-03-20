const Database = require("better-sqlite3");

const sqlite = new Database("notes.db");

const db = {
  run: (sql, params = [], cb) => {
    try {
      sqlite.prepare(sql).run(params);
      cb && cb(null);
    } catch (err) {
      cb && cb(err);
    }
  },

  get: (sql, params = [], cb) => {
    try {
      const row = sqlite.prepare(sql).get(params);
      cb(null, row);
    } catch (err) {
      cb(err);
    }
  },

  all: (sql, params = [], cb) => {
    try {
      const rows = sqlite.prepare(sql).all(params);
      cb(null, rows);
    } catch (err) {
      cb(err);
    }
  },

  serialize: (fn) => fn(),
};

module.exports = db;
