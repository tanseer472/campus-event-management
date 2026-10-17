const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/events', (req, res) => {
  db.all(`SELECT * FROM events`, [], (err, rows) => res.json(rows));
});

app.get('/api/events/:id', (req, res) => {
  db.get(`SELECT * FROM events WHERE id = ?`, [req.params.id], (err, row) => res.json(row));
});

app.post('/api/events', (req, res) => {
  const { title, description, date, time, location, category, capacity } = req.body;
  db.run(`INSERT INTO events VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, date, time, location, category, capacity], function(err) {
    res.json({id: this.lastID, ...req.body});
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, eventId } = req.body;
  db.run(`INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, 'temp-pass')`, [name, email], function(err) {
    const userId = this.lastID;
    db.run(`INSERT INTO registrations (user_id, event_id, registration_date) VALUES (?, ?, DATE('now'))`,
      [userId, eventId], () => res.json({message: '✅ Registered successfully!'}));
  });
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));