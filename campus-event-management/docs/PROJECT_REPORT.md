# Campus Event Management System
## Mini Project Report

**Course Project:** Full-Stack Web Application with Git & GitHub Collaboration  
**Project Title:** Campus Event Management System  
**Prepared by:** [Enter team members and student IDs]  
**Instructor:** [Enter instructor name]  
**Department / Semester:** [Enter details]  
**Date:** [Enter submission date]

## 1. Abstract
The Campus Event Management System is a web application designed to make it easier for university students to discover and register for campus events. Events may include seminars, workshops, sports events, competitions, conferences, and student society activities. The application uses HTML, CSS, and JavaScript for the user interface, Python Flask for REST API endpoints, and SQLite for persistent data storage.

## 2. Problem Statement
Campus event information may be distributed across notice boards, messages, and social media. Students can miss relevant events, and organizers may find it difficult to keep a consistent registration list. A central system can improve event discovery, provide a registration process, and keep event and registration data organized.

## 3. Objectives
- Provide a responsive event discovery page.
- Display event details including date, time, location, category, and available seats.
- Support search and category filtering.
- Allow students to create an account, log in, and register for events.
- Store users, events, and registrations in a relational database.
- Provide REST APIs for event CRUD operations and registration.
- Demonstrate Git and GitHub collaboration practices.

## 4. Scope
The prototype supports student accounts, event listing, event search/filtering, event registration, registration capacity checks, and admin-only event management endpoints. It is intended for academic demonstration and can be expanded with email verification, advanced role management, and production deployment controls.

## 5. Technology Stack
| Layer | Technology | Purpose |
|---|---|---|
| Front end | HTML5 | Page structure |
| Presentation | CSS3 | Responsive layout and visual design |
| Client logic | JavaScript | API calls, search, filtering, forms |
| Back end | Python Flask | HTTP routes and REST API |
| Database | SQLite | Persistent relational storage |
| Version control | Git | Local history and branches |
| Collaboration | GitHub | Remote repository, issues, pull requests |

## 6. System Architecture
The browser renders the frontend. JavaScript sends HTTP requests to Flask endpoints. Flask validates requests and reads/writes records in SQLite. The API returns JSON responses, which the frontend uses to update the interface.

**Flow:** Student/Admin → HTML/CSS/JavaScript → Flask REST API → SQLite database → JSON response → Updated interface.

## 7. Main Modules
### 7.1 Event listing
Retrieves event records from the database and displays cards with title, description, date, time, location, category, and remaining seats.

### 7.2 Search and filtering
Search supports event title, description, and location. Category filtering narrows the list to a selected event type.

### 7.3 Authentication
Students can create accounts and log in. Passwords are stored as password hashes rather than plain text. Flask sessions identify the logged-in user in the local demo.

### 7.4 Event registration
A logged-in student can register for an event. The backend checks that the event exists, capacity is available, and the student has not already registered.

### 7.5 Admin event management
The demo admin can create, update, and delete event records through the API. The UI currently provides a delete action; creation and update can be tested through an API client such as Postman or curl.

## 8. Database Design
### Users
- `id`: primary key
- `name`: student's name
- `email`: unique email
- `password_hash`: hashed password
- `role`: student or admin

### Events
- `id`: primary key
- `title`, `description`, `date`, `time`, `location`, `category`
- `capacity`: maximum number of registrations
- `created_by`: optional user reference

### Registrations
- `id`: primary key
- `user_id`: references Users
- `event_id`: references Events
- `registration_date`: timestamp
- A unique constraint on `(user_id, event_id)` prevents duplicate registration.

## 9. API Design
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/events` | List and filter events |
| GET | `/api/events/<id>` | Read one event |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/<id>` | Update event (admin) |
| DELETE | `/api/events/<id>` | Delete event (admin) |
| POST | `/api/signup` | Create student account |
| POST | `/api/login` | Authenticate |
| POST | `/api/logout` | End session |
| GET | `/api/me` | Read current user |
| POST | `/api/register` | Register for event |
| GET | `/api/registrations` | Read registrations |

## 10. Validation and Error Handling
The backend validates required fields, positive event capacity, account fields, login credentials, event existence, available capacity, and duplicate registration. It returns HTTP error codes and JSON error messages for invalid requests.

## 11. Git and GitHub Collaboration Plan
The repository should contain the frontend, backend, documentation, README, and `.gitignore`. Suggested task branches are:
- `feature/frontend-ui`
- `feature/frontend-functionality`
- `feature/backend-api`
- `feature/database-testing`

Each team member should commit their own work, push a branch, create a pull request, and participate in code review. The team lead should manage issues and merge reviewed pull requests. Evidence must reflect the team's actual activity.

## 12. Testing Plan
Test page loading, responsive design, search, filters, signup, login, logout, event registration, duplicate registration prevention, capacity checks, admin permissions, event CRUD endpoints, and database persistence. Capture screenshots of the running application and real API results.

## 13. Installation
Install Python 3.10+, create a virtual environment, install `requirements.txt`, and run `python app.py`. Open `http://127.0.0.1:5000`.

## 14. Limitations
This project is a local coursework prototype. It does not include email verification, password reset, production-grade admin provisioning, automated test suite, or production deployment configuration. A public deployment needs a secure secret key, HTTPS, CSRF protection, rate limiting, and persistent database hosting.

## 15. Future Enhancements
- JWT or stronger session-based authentication
- Admin dashboard and event creation form
- Email confirmations and reminders
- QR-code attendance
- Event capacity waitlist
- Automated unit and API tests
- GitHub Actions CI and cloud deployment

## 16. Conclusion
The Campus Event Management System demonstrates a full-stack architecture with a responsive frontend, Flask REST APIs, SQLite persistence, account handling, and event registration. It also provides a foundation for demonstrating Git branching and GitHub collaboration. The team should run the test checklist, collect real screenshots, and document actual contribution evidence before submission.
