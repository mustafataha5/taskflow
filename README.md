TaskFlow
TaskFlow is a full-stack task management application built with FastAPI, SQLModel, SQLite, Angular, TypeScript, and Tailwind CSS.

It is a hands-on engineering project focused on maintainable REST API development, modern Angular architecture, reactive state management, automated testing, and professional Git/GitHub workflows.
Project status: 🚧 V1 in development — Backend CRUD and API tests are implemented. Angular supports mock-data CRUD, reusable reactive create/edit forms, task details, client-side filters, and a responsive application shell. The frontend is not yet connected to FastAPI, so UI changes are not persistent.

Tech Stack
Layer	Technologies
Backend	Python, FastAPI
ORM and validation	SQLModel, SQLAlchemy, Pydantic
Database	SQLite (development)
Frontend	Angular (standalone components), TypeScript, Tailwind CSS
Frontend state	Angular Signals (signal, computed, input, output, effect)
Forms	Angular Reactive Forms, typed controls, custom validators
Routing	Angular Router, lazy-loaded pages, guards, nested layouts
API testing	pytest, FastAPI TestClient, HTTPX
Version control	Git, GitHub, feature branches, pull requests


Current Features
Backend — Implemented
- REST endpoints to create, list, retrieve, partially update, and delete tasks
- Task statuses: todo, in_progress, completed, archived
- Task priorities: low, medium, high
- Task categories: work, personal, learning, health, finance, other
- Due dates and automatic creation/update timestamps
- Pagination, filtering by status/priority/category, and sorting
- Request validation and HTTP error handling
- Health-check endpoint
- Automated endpoint tests using an isolated test database
Frontend — Implemented with Mock Data
- Responsive Angular application shell with header, sidebar, and nested routing
- Collapsible desktop sidebar, mobile navigation drawer, and light/dark styling
- Reusable TaskCard, TaskList, TaskStats, TaskFilter, and TaskForm components
- Shared TaskStoreService holding mock tasks in a private writable Signal and exposing readonly state
- In-memory create, retrieve, update, and delete operations through the store
- Task listing, statistics, and combined client-side status/priority/category filters
- Filter reset, results counter, and empty-filter state
- TaskFormPage smart container for creating and editing tasks; reusable TaskForm handles inputs and validation
- Typed Reactive Forms and input() / output() communication between parent and child
- Custom due-date validation: required, not in the past, and no more than two calendar years ahead
- Conversion of existing ISO due-date timestamps into YYYY-MM-DD for the native date input
- TaskDetailsPage for task metadata, status, priority, due date, and View/Edit/Delete navigation
- Reactive task selection through route parameters and computed Signals
- Numeric ID route guards and a NotFound route within MainLayout so the header/sidebar remain visible
- Save/loading input support in the form component, ready for asynchronous API integration
Mock-data limitation: The frontend currently uses in-memory mock tasks. Creating, editing, or deleting a task updates the UI, but a browser refresh restores the initial mock data. SQLite remains the backend data source, not yet connected to the Angular UI. Some other navigation entries remain placeholders.

Frontend — Next
- Connect existing TaskApiService to FastAPI through Angular HttpClient
- Load tasks from the backend and synchronize responses with TaskStoreService
- Add real asynchronous loading, success/error handling, and retry behavior
- Server-side search, pagination, filtering, and sorting
- Align frontend date-only inputs with backend date/datetime validation and persistence
- Add frontend component/validator tests and end-to-end full-stack tests
Project Structure
taskflow/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py
│       └── test_tasks.py
├── frontend/
│   ├── src/app/
│   │   ├── core/guards/             # Route guards
│   │   ├── layout/                  # Header, sidebar, main layout
│   │   ├── shared/validators/       # Reusable date validator
│   │   └── features/tasks/
│   │       ├── components/          # Task cards, lists, filters, stats, form
│   │       ├── pages/               # List, details, form pages
│   │       ├── models/              # Task and request interfaces
│   │       └── services/            # Task store and API service
│   ├── package.json
│   └── angular.json
├── .gitignore
└── README.md
This is a simplified architectural overview; use the repository as the source of truth for exact paths.
Getting Started
Prerequisites
- Python 3.11+ and pip
- Node.js and npm compatible with the Angular version in frontend/package.json
- Git
1. Clone the repository
git clone https://github.com/mustafataha5/taskflow.git
cd taskflow
Checkout the branch containing the most recent frontend implementation if it has not yet been merged into main:
git branch -a
# git switch <your-current-feature-branch>
2. Run the backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
On Windows, activate the environment with .venv\Scripts\activate instead.
- API base URL: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI schema: http://127.0.0.1:8000/openapi.json
The development SQLite database is initialized by the backend application.
3. Run the frontend
Open another terminal from the repository root:
cd frontend
npm install
npx ng serve
Open http://localhost:4200.

Note: Until API integration is implemented, the Angular UI uses mock data whether or not the backend is running.
API Reference
Method	Endpoint	Description
GET	/health	Check API health
GET	/tasks	List tasks with filtering, sorting, and pagination
GET	/tasks/{task_id}	Retrieve a task
POST	/tasks	Create a task
PATCH	/tasks/{task_id}	Partially update a task
DELETE	/tasks/{task_id}	Delete a task


Create a task
POST /tasks
{
  "title": "Implement Angular task forms",
  "description": "Practice reactive forms and validation",
  "status": "todo",
  "priority": "high",
  "category": "learning",
  "due_date": "2026-12-01T18:00:00Z"
}
Update a task
PATCH /tasks/1
{
  "status": "in_progress",
  "priority": "medium"
}
Only supplied fields are updated. A non-empty PATCH request refreshes updated_at.
Filter, sort, and paginate
GET /tasks?page=1&page_size=10&status=todo&priority=high&category=learning&sort_by=due_date&order=asc
Parameter	Values	Default
page	Integer ≥ 1	1
page_size	Integer, maximum 100	10
status	todo, in_progress, completed, archived	All
priority	low, medium, high	All
category	work, personal, learning, health, finance, other	All
sort_by	created_at, due_date	created_at
order	asc, desc	desc


The task listing currently returns a JSON array; pagination metadata in a response wrapper is not implemented.
Automated Testing
Run backend tests from backend/:
python -m pytest -v
Tests cover the health endpoint, CRUD, error handling, validation, timestamps, filtering, sorting, and pagination. Task tests use an isolated SQLite test database.

Previously reported backend result: 24 tests passed. Rerun the suite to verify your latest changes.
Frontend manual testing
- /tasks: lists mock tasks, updates counters, and supports filtering
- /tasks/new: validates inputs and adds a task to the store
- /tasks/1: shows read-only task details and edit/delete actions
- /tasks/1/edit: prepopulates the form; changes update the store
- /tasks/abc/edit: routes to NotFound while retaining the application layout
- /tasks/999/edit: handles a missing task without silently creating one
- Browser refresh: resets the in-memory store to its initial mock data
These scenarios are manual checks, not a claim that frontend automated tests have passed.
Angular Architecture
TaskFlow separates smart container pages from reusable presentational components:
MainLayout (header, sidebar, router-outlet)
├── TaskListPage (smart)
│   ├── TaskStats        ← all tasks
│   ├── TaskFilter       ↔ filters and change events
│   └── TaskList         ← filtered tasks
│       └── TaskCard     → view, edit, delete
├── TaskDetailsPage (smart)
│   └── selected task    ← TaskStoreService + route ID
└── TaskFormPage (smart; create/edit)
    └── TaskForm         ← task, saving inputs; save output

TaskFormPage / TaskListPage / TaskDetailsPage
        ↕
TaskStoreService (Signals; mock state)

Future integration:
TaskStoreService ↔ TaskApiService (HttpClient) ↔ FastAPI ↔ SQLite
- TaskStoreService is root-provided and owns the shared in-memory task list.
- TaskListPage derives filtered tasks with computed(); statistics use the unfiltered list.
- TaskForm owns its FormGroup, validation, input display, and save.emit().
- TaskFormPage handles route mode, store updates, and navigation.
- TaskDetailsPage reacts to both route IDs and task-store changes.
- MainLayout preserves header/sidebar navigation, including the NotFound view.
Development Workflow
Use a feature branch for a coherent change, review its diff, then push it and open a pull request against the intended integration branch. Do not assume the branch names or merge state from older notes; check your current repository before committing.
git branch --show-current
git status
git diff --stat
Example Conventional Commit messages:
feat(frontend): add task filtering and responsive layout
feat(frontend): implement reactive task forms and mock CRUD
fix(router): keep not-found page inside main layout
test(api): cover task filtering and pagination
docs: update README for frontend mock CRUD milestone
Latest documented frontend milestone (November 11, 2026)
Implemented mock CRUD via TaskStoreService, reusable reactive TaskForm with required due-date validation, create/edit form page, read-only task details, card View/Edit actions, and in-layout not-found routing. This section records development progress; it is not a verified Git commit history.
Roadmap
Phase 1 — Backend
- [x] FastAPI, SQLModel, and SQLite setup
- [x] Task CRUD, enums, due dates, and timestamps
- [x] Validation and error handling
- [x] Filtering, sorting, and pagination
- [x] Backend automated tests
Phase 2 — Angular Frontend
- [x] Angular setup, standalone components, and routing
- [x] Header, sidebar, and main layout
- [x] Task models and local mock data
- [x] Reusable task list and cards
- [x] Task statistics with computed Signals
- [x] Client-side filtering and responsive UI (Phase 2.5)
- [x] Shared Signals store for mock CRUD
- [x] Reactive create/edit task forms and custom due-date validator (Phase 2.6)
- [x] Task details, View/Edit actions, and not-found layout handling
- [ ] FastAPI integration through Angular services (Phase 2.7)
- [ ] API loading/error handling and server-side list controls (Phase 2.8)
- [ ] Frontend automated and end-to-end tests
V1 Release
- [ ] Persistent task management through the UI
- [ ] Final responsive and accessibility checks
- [ ] Documentation and release verification
- [ ] Tag stable release as v1.0.0
Versioning
TaskFlow plans to use Git tags and GitHub Releases, beginning with v1.0.0 for the first stable full-stack version. Future releases will follow Semantic Versioning where appropriate.
License
No license has been selected yet.
TaskFlow — Learning by building a maintainable, tested full-stack application.