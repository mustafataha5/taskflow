# TaskFlow

**TaskFlow** is a full-stack task management application built with **FastAPI, SQLModel, SQLite, Angular, TypeScript, and Tailwind CSS**.

It is a hands-on engineering project focused on building a maintainable REST API, practicing modern Angular architecture and reactive state management, writing automated tests, and following professional Git/GitHub workflows.

> **Project status:** 🚧 **V1 in development** — Backend CRUD and automated API tests are complete. The Angular UI, client-side task filtering, and responsive application shell are implemented using mock task data. Reactive forms and live API integration are next.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Python, FastAPI |
| ORM and validation | SQLModel, SQLAlchemy, Pydantic |
| Database | SQLite (development) |
| Frontend | Angular (standalone components), TypeScript, Tailwind CSS |
| Frontend state | Angular Signals (`signal`, `computed`, `input`, `output`) |
| API testing | pytest, FastAPI TestClient, HTTPX |
| Version control | Git, GitHub, feature branches, pull requests |

## Current Features

### Backend — Implemented

- REST endpoints to create, list, retrieve, partially update, and delete tasks
- Task statuses: `todo`, `in_progress`, `completed`, `archived`
- Task priorities: `low`, `medium`, `high`
- Task categories: `work`, `personal`, `learning`, `health`, `finance`, `other`
- Optional due dates and automatic creation/update timestamps
- Pagination, filtering by status/priority/category, and sorting
- Request validation and HTTP error handling
- Health-check endpoint
- Automated endpoint tests using an isolated test database

### Frontend — Implemented with Mock Data

- Angular application shell with a header, sidebar, and nested routing
- Responsive dashboard/task-page layout styled with Tailwind CSS
- Desktop sidebar collapse/expand and mobile navigation drawer
- Reusable `TaskCard`, `TaskList`, `TaskStats`, and `TaskFilter` components
- Local task listing and deletion using Angular Signals
- Reactive task statistics using `computed()`
- Combined client-side filtering by status, priority, and category, including Reset
- Filtered-result counter and empty-filter state
- Parent–child communication with `input()` and `output()`
- Light/dark styling support

**Important:** The frontend currently uses local mock tasks. Changes made in the UI are **not yet persisted** in SQLite. Some navigation entries are placeholders; only the currently implemented routes are expected to work.

### Frontend — Next

- Reactive task creation and editing forms with validation
- Angular service integration with the FastAPI REST endpoints
- Loading, success, and error states
- Server-side search, pagination, filtering, and sorting
- Frontend tests and full-stack validation

## Project Structure

```text
taskflow/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py
│       └── test_tasks.py
├── frontend/                  # Angular application
│   ├── src/
│   │   └── app/
│   │       ├── layout/       # Header, sidebar, main layout
│   │       └── features/
│   │           └── tasks/    # Task models, pages, components
│   ├── package.json
│   └── angular.json
├── .gitignore
└── README.md
```

*The tree is a simplified architectural overview; consult the repository for exact file and directory names.*

## Getting Started

### Prerequisites

- Python 3.11+ and pip
- Node.js and npm compatible with the Angular version in `frontend/package.json`
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mustafataha5/taskflow.git
cd taskflow
```

> The actively developed frontend may be ahead of `main`. To inspect the current frontend work, switch to `feature/angular-frontend` after it has received the relevant feature-branch merges.

### 2. Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

On Windows, activate the environment with `.venv\Scripts\activate` instead.

API base URL: <http://127.0.0.1:8000>

- Swagger UI: <http://127.0.0.1:8000/docs>
- OpenAPI schema: <http://127.0.0.1:8000/openapi.json>

The development SQLite database is initialized by the backend application.

### 3. Run the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npx ng serve
```

Open <http://localhost:4200>.

**Note:** Until API integration is implemented, the task list displays mock data even when the backend is running.

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check API health |
| `GET` | `/tasks` | List tasks with optional filtering, sorting, and pagination |
| `GET` | `/tasks/{task_id}` | Retrieve a task by ID |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/{task_id}` | Partially update a task |
| `DELETE` | `/tasks/{task_id}` | Delete a task |

### Create a task

`POST /tasks`

```json
{
  "title": "Implement Angular task forms",
  "description": "Practice reactive forms and validation",
  "status": "todo",
  "priority": "high",
  "category": "learning",
  "due_date": "2026-12-01T18:00:00Z"
}
```

### Update a task

`PATCH /tasks/1`

```json
{
  "status": "in_progress",
  "priority": "medium"
}
```

Only supplied fields are updated. A non-empty PATCH request refreshes `updated_at`.

### Filter, sort, and paginate

```http
GET /tasks?page=1&page_size=10&status=todo&priority=high&category=learning&sort_by=due_date&order=asc
```

| Parameter | Values | Default |
| --- | --- | --- |
| `page` | Integer ≥ 1 | `1` |
| `page_size` | Integer, maximum 100 | `10` |
| `status` | `todo`, `in_progress`, `completed`, `archived` | All |
| `priority` | `low`, `medium`, `high` | All |
| `category` | `work`, `personal`, `learning`, `health`, `finance`, `other` | All |
| `sort_by` | `created_at`, `due_date` | `created_at` |
| `order` | `asc`, `desc` | `desc` |

The task listing currently returns a JSON array. Pagination metadata in a response wrapper is not implemented.

## Automated Testing

Run the backend test suite from `backend/`:

```bash
python -m pytest -v
```

Tests cover the health endpoint, CRUD operations, error handling, validation, timestamps, filtering, sorting, and pagination. Task tests use an isolated SQLite test database.

**Latest previously reported backend result:** 24 tests passed. Rerun the command above for the current result.

## Angular Architecture

TaskFlow uses **smart (container)** and **presentational** components:

```text
TaskListPage (container)
├── TaskStats        ← all tasks
├── TaskFilter       ↔ filter values and change events
└── TaskList         ← filtered tasks
    └── TaskCard     → delete event
```

- `TaskListPage` owns the local task and filter signals.
- `computed()` derives filtered tasks and statistics without manually synchronizing copies.
- `TaskFilter` receives values via `input()` and reports changes via `output()`.
- `TaskStats` always receives the complete task list, regardless of active filters.
- `MainLayout` owns sidebar state for desktop collapse and mobile drawer visibility.

This architecture is intentionally being developed incrementally before introducing API-driven shared state.

## Development Workflow

Active frontend development uses an integration branch and short-lived feature branches:

```text
main
└── feature/angular-frontend
    ├── feature/task-filtering   # Filtering and responsive UI
    └── feature/task-forms       # Next planned feature
```

The diagram describes **branch lineage and intended merges**, not independent permanent branches. Feature changes are reviewed and merged into `feature/angular-frontend`, and the completed frontend will eventually be merged into `main`.

Recommended workflow:

1. Create a feature branch from the latest `feature/angular-frontend`.
2. Implement and test one feature.
3. Commit with a descriptive Conventional Commit message.
4. Push the branch and open a pull request targeting `feature/angular-frontend`.
5. Review, merge, and update your local integration branch.
6. Merge the integration branch into `main` when the frontend is ready.

Example commit messages:

```text
feat(frontend): add task filtering and responsive layout
feat(frontend): add reactive task form
fix(frontend): close mobile sidebar after navigation
test(api): cover task filtering and pagination
docs: update development progress
```

## Roadmap

### Phase 1 — Backend

- [x] FastAPI, SQLModel, and SQLite setup
- [x] Task CRUD, enums, due dates, and timestamps
- [x] Validation and error handling
- [x] Filtering, sorting, and pagination
- [x] Backend automated tests

### Phase 2 — Angular Frontend

- [x] Angular setup, standalone components, and routing
- [x] Header, sidebar, and main layout
- [x] Task models and local mock task data
- [x] Reusable task list and cards
- [x] Task statistics with computed Signals
- [x] Local deletion with `signal.update()`
- [x] **2.5:** Task filters, reset, and responsive UI
- [x] Desktop collapsible sidebar and mobile drawer
- [ ] **2.6:** Reactive create/edit task forms
- [ ] **2.7:** FastAPI integration through Angular services
- [ ] **2.8:** API loading/error handling and server-side list controls
- [ ] Frontend and end-to-end tests

### V1 Release

- [ ] Persistent task management through the UI
- [ ] Final responsive and accessibility checks
- [ ] Documentation and release verification
- [ ] Tag first stable release as `v1.0.0`

## Versioning

TaskFlow plans to use Git tags and GitHub Releases, beginning with `v1.0.0` for the first stable full-stack version. Future releases will follow Semantic Versioning where applicable.

## License

No license has been selected yet.

---

**TaskFlow** — Learning by building a maintainable, tested, full-stack application.
