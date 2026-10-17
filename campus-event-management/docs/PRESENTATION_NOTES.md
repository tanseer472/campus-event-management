# 5–7 Minute Presentation Notes

## Slide 1 — Title (30 seconds)
Assalam-o-alaikum. Our project is the Campus Event Management System. It helps university students discover campus events and register online.

## Slide 2 — Problem and objectives (45 seconds)
Event details can be scattered across different channels. Our system centralizes event information, provides search and category filters, and records student registrations.

## Slide 3 — Technology stack (45 seconds)
We use HTML, CSS, and JavaScript in the frontend, Python Flask for backend routes and REST APIs, and SQLite as the database. Git and GitHub support version control and team collaboration.

## Slide 4 — Architecture (45 seconds)
The browser calls Flask endpoints using JavaScript fetch. Flask validates the request and reads or writes SQLite records. The backend returns JSON and the page displays the results.

## Slide 5 — Live demo (2 minutes)
1. Open the home page and show event cards.
2. Search for “AI” and show the result.
3. Filter by Workshop.
4. Create a student account and log in.
5. Register for an event.
6. Attempt to register for the same event again and show duplicate protection.
7. Log out and sign in with the local demo admin account to show the admin delete control.
8. Visit `/api/health` and `/api/events` to show JSON API responses.

Demo admin credentials for local demo only: `admin@campus.edu` / `Admin123!`.

## Slide 6 — Database and testing (45 seconds)
SQLite contains Users, Events, and Registrations tables. We enforce unique emails and unique student/event registrations. We test event listing, search, filtering, login, registration, and admin permissions.

## Slide 7 — GitHub workflow and conclusion (60 seconds)
We use feature branches, meaningful commits, issues, pull requests, code reviews, and merge into main. Show only the branches, commits, issues, and pull requests that the team actually created. The project can be extended with email notifications, QR attendance, automated tests, and cloud deployment.

## Questions teacher may ask
**Q: Why Flask?** It is lightweight, easy to configure, and provides a straightforward way to build REST APIs in Python.

**Q: Why SQLite?** It is a relational database stored in a local file, so setup is simple for a classroom demo.

**Q: What is a REST API?** An interface that lets the frontend communicate with the backend through HTTP methods such as GET, POST, PUT, and DELETE.

**Q: What does CRUD mean?** Create, Read, Update, and Delete.

**Q: How is duplicate registration prevented?** The backend checks registrations and the database has a unique constraint on the pair of user ID and event ID.

**Q: How are passwords stored?** As hashes using Werkzeug's password hashing helpers, not as plain text.

**Q: What is Git branching?** It lets team members work on separate features without directly changing the stable main branch.

**Q: What is a pull request?** A request to review and merge changes from one branch into another.

**Q: What would you improve next?** Add automated tests, stronger production security, admin event forms, email confirmation, and cloud deployment.

**Important:** Be honest about which features and collaboration steps were actually completed by your team.
