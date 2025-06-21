const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./medication.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient', 'caretaker'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  date_taken TEXT,
  image TEXT, -- optional: path to uploaded proof image
  FOREIGN KEY(user_id) REFERENCES users(id)
);
  `);
  db.run(`
   CREATE TABLE IF NOT EXISTS medication_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  medicationName TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
  `);

});

module.exports = db;