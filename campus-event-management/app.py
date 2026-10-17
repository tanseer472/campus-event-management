from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os
from functools import wraps
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "campus_events.db")
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-for-production")

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
        );
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            category TEXT NOT NULL,
            capacity INTEGER NOT NULL DEFAULT 50 CHECK(capacity >= 0),
            created_by INTEGER,
            FOREIGN KEY(created_by) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            registration_date TEXT NOT NULL,
            UNIQUE(user_id, event_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
        );
        """)
        count = con.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        if count == 0:
            seed = [
                ("AI & Machine Learning Workshop", "Hands-on introduction to AI concepts, tools, and practical applications.", "2026-11-05", "10:00", "Computer Lab 2", "Workshop", 60),
                ("Annual Sports Gala", "A day of cricket, badminton, football, and team activities.", "2026-11-10", "09:00", "University Sports Ground", "Sports", 200),
                ("Research & Innovation Seminar", "Learn how to develop research ideas and present technical work.", "2026-11-14", "11:30", "Main Auditorium", "Seminar", 100),
                ("Programming Competition", "A friendly coding contest for students of all departments.", "2026-11-18", "13:00", "Lab 1", "Competition", 80),
                ("Career Development Conference", "Talks on internships, CV writing, and industry skills.", "2026-11-22", "10:30", "Conference Hall", "Conference", 120),
                ("Society Welcome Meetup", "Meet student societies and learn how to participate in campus life.", "2026-11-25", "12:00", "Student Center", "Society", 90)
            ]
            con.executemany("""INSERT INTO events
                (title, description, date, time, location, category, capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?)""", seed)

def current_user():
    if not session.get("user_id"):
        return None
    with db() as con:
        row = con.execute("SELECT id, name, email, role FROM users WHERE id=?", (session["user_id"],)).fetchone()
        return dict(row) if row else None

def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_user():
            return jsonify({"error": "Please log in first."}), 401
        return fn(*args, **kwargs)
    return wrapper

def event_dict(row):
    item = dict(row)
    item["registered"] = item.get("registered", 0)
    item["seats_left"] = max(0, item["capacity"] - item["registered"])
    return item

@app.route("/")
def home():
    return render_template("index.html")

@app.get("/api/events")
def get_events():
    q = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    sql = """SELECT e.*, COUNT(r.id) AS registered
             FROM events e LEFT JOIN registrations r ON r.event_id=e.id"""
    where, params = [], []
    if q:
        where.append("(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)")
        params.extend([f"%{q}%"] * 3)
    if category and category != "All":
        where.append("e.category=?")
        params.append(category)
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += " GROUP BY e.id ORDER BY e.date, e.time"
    with db() as con:
        rows = con.execute(sql, params).fetchall()
    return jsonify([event_dict(dict(r)) for r in rows])

@app.get("/api/events/<int:event_id>")
def get_event(event_id):
    with db() as con:
        row = con.execute("""SELECT e.*, COUNT(r.id) AS registered
            FROM events e LEFT JOIN registrations r ON r.event_id=e.id
            WHERE e.id=? GROUP BY e.id""", (event_id,)).fetchone()
    if not row:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event_dict(dict(row)))

@app.post("/api/events")
@login_required
def create_event():
    user = current_user()
    if user["role"] != "admin":
        return jsonify({"error": "Admin access required. Sign in with the demo admin account."}), 403
    data = request.get_json(silent=True) or {}
    required = ["title", "description", "date", "time", "location", "category"]
    if any(not str(data.get(k, "")).strip() for k in required):
        return jsonify({"error": "Please complete all required event fields."}), 400
    try:
        capacity = int(data.get("capacity", 50))
        if capacity < 1: raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Capacity must be a positive number."}), 400
    with db() as con:
        cur = con.execute("""INSERT INTO events
            (title, description, date, time, location, category, capacity, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (data["title"].strip(), data["description"].strip(), data["date"], data["time"],
             data["location"].strip(), data["category"], capacity, user["id"]))
        event_id = cur.lastrowid
    return jsonify({"message": "Event created", "id": event_id}), 201

@app.put("/api/events/<int:event_id>")
@login_required
def update_event(event_id):
    user = current_user()
    if user["role"] != "admin":
        return jsonify({"error": "Admin access required."}), 403
    data = request.get_json(silent=True) or {}
    fields = ["title", "description", "date", "time", "location", "category", "capacity"]
    with db() as con:
        row = con.execute("SELECT id FROM events WHERE id=?", (event_id,)).fetchone()
        if not row: return jsonify({"error": "Event not found"}), 404
        values = [data.get(k) for k in fields]
        if any(v is None or str(v).strip() == "" for v in values):
            return jsonify({"error": "All event fields are required."}), 400
        try:
            values[-1] = int(values[-1])
            if values[-1] < 1: raise ValueError()
        except (ValueError, TypeError):
            return jsonify({"error": "Capacity must be a positive number."}), 400
        con.execute("""UPDATE events SET title=?, description=?, date=?, time=?,
            location=?, category=?, capacity=? WHERE id=?""", (*values, event_id))
    return jsonify({"message": "Event updated"})

@app.delete("/api/events/<int:event_id>")
@login_required
def delete_event(event_id):
    user = current_user()
    if user["role"] != "admin":
        return jsonify({"error": "Admin access required."}), 403
    with db() as con:
        cur = con.execute("DELETE FROM events WHERE id=?", (event_id,))
        if cur.rowcount == 0: return jsonify({"error": "Event not found"}), 404
    return jsonify({"message": "Event deleted"})

@app.post("/api/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name, email, password = [str(data.get(k, "")).strip() for k in ("name", "email", "password")]
    if not name or not email or len(password) < 6:
        return jsonify({"error": "Enter name, valid email, and password (at least 6 characters)."}), 400
    try:
        with db() as con:
            cur = con.execute("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'student')",
                              (name, email.lower(), generate_password_hash(password)))
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({"error": "This email is already registered."}), 409
    session["user_id"] = user_id
    return jsonify({"message": "Account created", "user": current_user()}), 201

@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    with db() as con:
        user = con.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    # Demo admin account is created only for this local coursework demo.
    if not user and email == "admin@campus.edu" and password == "Admin123!":
        with db() as con:
            con.execute("INSERT OR IGNORE INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin')",
                        ("Campus Admin", email, generate_password_hash(password)))
            user = con.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password."}), 401
    session["user_id"] = user["id"]
    return jsonify({"message": "Login successful", "user": current_user()})

@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})

@app.get("/api/me")
def me():
    return jsonify({"user": current_user()})

@app.post("/api/register")
@login_required
def register_event():
    user = current_user()
    data = request.get_json(silent=True) or {}
    try: event_id = int(data.get("event_id"))
    except (TypeError, ValueError): return jsonify({"error": "Valid event ID required."}), 400
    with db() as con:
        event = con.execute("SELECT capacity FROM events WHERE id=?", (event_id,)).fetchone()
        if not event: return jsonify({"error": "Event not found."}), 404
        count = con.execute("SELECT COUNT(*) FROM registrations WHERE event_id=?", (event_id,)).fetchone()[0]
        if count >= event["capacity"]: return jsonify({"error": "Sorry, this event is full."}), 409
        try:
            con.execute("INSERT INTO registrations(user_id,event_id,registration_date) VALUES(?,?,?)",
                        (user["id"], event_id, datetime.now().isoformat(timespec="seconds")))
        except sqlite3.IntegrityError:
            return jsonify({"error": "You are already registered for this event."}), 409
    return jsonify({"message": "Successfully registered for event."}), 201

@app.get("/api/registrations")
@login_required
def registrations():
    user = current_user()
    with db() as con:
        if user["role"] == "admin":
            rows = con.execute("""SELECT r.id, u.name AS student_name, u.email, e.title AS event_title,
                r.registration_date FROM registrations r JOIN users u ON u.id=r.user_id
                JOIN events e ON e.id=r.event_id ORDER BY r.registration_date DESC""").fetchall()
        else:
            rows = con.execute("""SELECT r.id, e.title AS event_title, e.date, e.time, e.location,
                r.registration_date FROM registrations r JOIN events e ON e.id=r.event_id
                WHERE r.user_id=? ORDER BY r.registration_date DESC""", (user["id"],)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "database": "SQLite", "service": "Campus Event Management API"})

init_db()
if __name__ == "__main__":
    app.run(debug=True, port=5000)
