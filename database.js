const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./campus.db', err => {
  if (err) console.error('DB error:', err);
  else console.log('✅ Connected to SQLite');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'student'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT, description TEXT, date TEXT, time TEXT,
    location TEXT, category TEXT, capacity INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, event_id INTEGER, registration_date DATE
  )`);

  const stmt = db.prepare(`INSERT OR IGNORE INTO events VALUES 
    (1, 'AI & Future Tech Workshop', 'Learn basics of AI', '2025-11-15', '10:00', 'Main Hall A', 'Workshop', 50),
    (2, 'Annual Sports Gala', 'Inter-department sports competition', '2025-12-01', '09:00', 'Sports Complex', 'Sports', 200),
    (3, 'Research Trends Seminar', 'Latest research directions', '2025-11-20', '14:00', 'Lecture Hall B', 'Seminar', 80)`);
  stmt.run();
  stmt.finalize();
});

module.exports = db;