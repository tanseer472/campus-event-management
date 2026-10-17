# Campus Event Management System

A full-stack university event portal built for the mini project **Full-Stack Web Application with Git & GitHub Collaboration**.

## Features
- Responsive home page and event cards
- SQLite database with Users, Events, and Registrations tables
- REST APIs for event listing/details, create/update/delete, signup/login/logout, event registration, registrations, and health check
- Search events by title, description, or location
- Filter by category
- Student signup/login with hashed passwords
- Registration prevents duplicate signups and checks event capacity
- Admin demo account can create/delete events; PUT endpoint supports event updates
- Git-ready repository, `.gitignore`, and documentation

## Technology
- Front end: HTML5, CSS3, JavaScript
- Back end: Python Flask
- Database: SQLite
- Version control: Git and GitHub

## Run locally (Windows)
1. Install Python 3.10 or later.
2. Extract this folder and open Command Prompt in it.
3. Create and activate a virtual environment:
   ```bat
   python -m venv .venv
   .venv\Scripts\activate
   ```
4. Install requirements:
   ```bat
   pip install -r requirements.txt
   ```
5. Start the server:
   ```bat
   python app.py
   ```
6. Open `http://127.0.0.1:5000` in your browser.

## Run locally (Linux / Ubuntu)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Open `http://127.0.0.1:5000`.

## Demo admin (local coursework demonstration only)
- Email: `admin@campus.edu`
- Password: `Admin123!`

The demo admin account is created when you first log in using these credentials. Do not use this demo password in a public/production deployment.

## REST API quick reference
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API status |
| GET | `/api/events` | List events; supports `?q=AI&category=Workshop` |
| GET | `/api/events/<id>` | Event details |
| POST | `/api/signup` | Create student account |
| POST | `/api/login` | Log in |
| POST | `/api/logout` | Log out |
| GET | `/api/me` | Current session user |
| POST | `/api/register` | Register logged-in student for an event |
| GET | `/api/registrations` | View registrations for logged-in user; admin sees all |
| POST | `/api/events` | Admin-only create event |
| PUT | `/api/events/<id>` | Admin-only update event |
| DELETE | `/api/events/<id>` | Admin-only delete event |

JSON body for `POST /api/events` and `PUT /api/events/<id>`:
```json
{
  "title": "Cloud Computing Workshop",
  "description": "Introduction to cloud platforms",
  "date": "2026-11-30",
  "time": "10:00",
  "location": "Computer Lab 1",
  "category": "Workshop",
  "capacity": 40
}
```

## Database schema
- `users(id, name, email, password_hash, role)`
- `events(id, title, description, date, time, location, category, capacity, created_by)`
- `registrations(id, user_id, event_id, registration_date)`
- Unique constraints prevent duplicate email accounts and duplicate registrations for the same event.

## Suggested GitHub collaboration workflow
Use a single shared GitHub repository. Team members should own separate branches and make genuine, task-based contributions. Do not claim commits or reviews that did not happen.

```bash
git switch -c feature/frontend-ui
git add templates/index.html static/style.css
git commit -m "Build responsive campus event interface"
git push -u origin feature/frontend-ui
```
Then open a Pull Request on GitHub and ask the team lead to review and merge it. Repeat with real tasks for backend, database/testing, and frontend functionality. Add GitHub Issues and assign them to actual team members.

## Testing checklist
- [ ] Home page loads
- [ ] Events display from SQLite via API
- [ ] Search and category filter work
- [ ] Student signup and login work
- [ ] Register for an event while logged in
- [ ] Duplicate registration is blocked
- [ ] Admin login works
- [ ] Admin can delete an event
- [ ] `/api/health` returns status `ok`
- [ ] Test event creation/update/delete API and record actual results

## Limitations / production notes
This is a coursework demo, not a production-ready identity system. Before public deployment, configure a strong secret key, use HTTPS, add CSRF protection/rate limiting, improve admin provisioning, and use production server settings. The database is local SQLite; public hosting needs persistent storage configured by the chosen platform.
