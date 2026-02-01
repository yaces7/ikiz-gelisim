const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'twin_platform.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(async () => {
  // 1. Users Table (Updated for Research Requirements)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    role TEXT CHECK(role IN ('twin', 'parent', 'admin')),
    
    -- Demographics
    gender TEXT,
    birth_date DATE,
    twin_type TEXT, -- 'monozygotic' (tek), 'dizygotic' (çift)
    
    -- Research Group Logic
    group_type TEXT DEFAULT 'control', -- 'experiment', 'control'
    family_code TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // ... (Other tables remain relatively same, adding simple checks if they exist)

  db.run(`CREATE TABLE IF NOT EXISTS progression (
    user_id INTEGER,
    current_week INTEGER DEFAULT 1,
    is_locked BOOLEAN DEFAULT 0,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS identity_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scenario_id TEXT,
    choice_weight INTEGER,
    autonomy_score REAL,
    dependency_score REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    me_count INTEGER,
    we_count INTEGER,
    sentiment_score REAL,
    week_number INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS scale_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    scale_type TEXT, 
    scores_json TEXT,
    total_score REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed Admin & Demo Users if empty
  db.get("SELECT count(*) as count FROM users", [], async (err, row) => {
    if (row.count === 0) {
      const hash = await bcrypt.hash('123456', 10);

      // Experiment Group Twin
      db.run(`INSERT INTO users (username, password_hash, role, group_type, family_code, full_name, twin_type) 
                  VALUES ('deney_ikiz1', ?, 'twin', 'experiment', 'FAMILY01', 'Deney İkiz 1', 'monozygotic')`, [hash]);

      // Control Group Twin
      db.run(`INSERT INTO users (username, password_hash, role, group_type, family_code, full_name, twin_type) 
                  VALUES ('kontrol_ikiz1', ?, 'twin', 'control', 'FAMILY02', 'Kontrol İkiz 1', 'dizygotic')`, [hash]);

      console.log("Database seeded with demo users (Password: 123456)");
    }
  });
});

module.exports = db;
