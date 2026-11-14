# TaskFlow

**TaskFlow** is a full-stack task management application built with **Angular, TypeScript, Tailwind CSS, FastAPI, SQLModel, and SQLite**. It is a practical engineering project focused on clean REST APIs, reusable frontend components, reactive state, automated testing, and a disciplined Git/GitHub workflow.

> **Status:** 🚧 **V1 in development** — Angular task CRUD is integrated with FastAPI and persists to SQLite. Backend analytics, Kanban retrieval, search, and due-date filters have been implemented on the current backend feature work and **37 backend tests passed locally on November 14, 2026**. The table/board views and frontend integration for the new analytics endpoints are still planned.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Angular (standalone components), TypeScript, Tailwind CSS |
| Frontend architecture | Angular Signals, reactive forms, feature-based components, smart/presentational separation |
| Backend | Python, FastAPI |
| ORM and validation | SQLModel, SQLAlchemy, Pydantic |
| Database | SQLite (development) |
| Testing | pytest, FastAPI TestClient / HTTPX |
| Workflow | Git, GitHub, feature branches, pull requests, Conventional Commits |

## Features

### Backend — implemented

- Task creation, retrieval, listing, partial update, and deletion, with SQLite persistence.
- Statuses: `todo`, `in_progress`, `completed`, `archived`.
- Priorities: `low`, `medium`, `high`.
- Categories: `work`, `personal`, `learning`, `health`, `finance`, `other`.
- Optional due dates and `created_at` / `updated_at` timestamps.
- Paginated task listing with filtering by status, priority, and category.
- Sorting by `created_at` or `due_date`, ascending or descending.
- Case-insensitive title/description search, including escaped SQL LIKE wildcards.
- Due-date range filtering with timezone-aware query validation.
- Database-wide task statistics: total, counts by status, and overdue unfinished tasks.
- Non-paginated task retrieval by status for the planned Kanban board (appropriate for V1-scale datasets).
- Request validation, HTTP error handling, CORS for local Angular development, Swagger/OpenAPI documentation, and health check.

### Frontend — implemented

- Angular standalone application with nested routes, a responsive header and sidebar, desktop sidebar collapse, and mobile navigation drawer.
- Task list and reusable task components, including task cards, filters, and statistics UI.
- Reactive task create/edit forms with validation.
- Angular service integration with FastAPI for **real create, read, update, and delete operations**.
- Task listing with filtering and pagination functionality.
- Angular Signals, component inputs/outputs, and smart/presentational component patterns.
- Tailwind-based responsive design.

> **Scope note:** The existing task-list CRUD flow uses live API data, not mock-only data. The new database-wide stats endpoint is not yet connected to the stats cards, and the table and Kanban board views have not yet been implemented. Some secondary navigation entries may remain placeholders.

## Project Structure

```text
taskflow/
├── backend/
│   ├── main.py                 # FastAPI endpoints
│   ├── models.py               # SQLModel models, enums and API schemas
│   ├── database.py             # Engine and session dependency
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py         # Isolated test setup
│       └── test_tasks.py       # API tests
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── layout/         # Main layout, header, sidebar
│   │       ├── features/
│   │       │   └── tasks/      # Task pages, models, services, components
│   │       └── core/          # Shared application infrastructure
│   ├── package.json
│   └── angular.json
├── .gitignore
└── README.md
```

*Simplified overview; consult the source tree for exact filenames and directories.*

## Getting Started

### Prerequisites

- Python 3.11+ and `pip` (development tests were run with Python 3.12).
- Node.js and npm compatible with the Angular version in `frontend/package.json`.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/mustafataha5/taskflow.git
cd taskflow
```

> In-progress features may live on a feature branch before its pull request is merged into `main`.

### 2. Start the FastAPI backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

On Windows, activate the environment with `.venv\Scripts\activate` instead.

- API: <http://127.0.0.1:8000>
- Swagger UI: <http://127.0.0.1:8000/docs>
- OpenAPI schema: <http://127.0.0.1:8000/openapi.json>

The development SQLite database is initialized by the backend application.

### 3. Start the Angular frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npx ng serve
```

Open <http://localhost:4200>. Keep the backend running for live task CRUD. The backend currently allows the local frontend origin `http://localhost:4200` through CORS.

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `GET` | `/tasks` | Paginated task listing, search, filtering and sorting |
| `GET` | `/tasks/stats` | Database-wide status counts and overdue count |
| `GET` | `/tasks/by-status/{task_status}` | All tasks with a specified status; no pagination |
| `GET` | `/tasks/{task_id}` | Retrieve a task by ID |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/{task_id}` | Partially update a task |
| `DELETE` | `/tasks/{task_id}` | Delete a task (`204 No Content`) |

### Create a task

`POST /tasks`

```json
{
  "title": "Implement Kanban board",
  "description": "Add columns for task statuses",
  "status": "todo",
  "priority": "high",
  "category": "learning",
  "due_date": "2026-12-01T18:00:00Z"
}
```

### Partially update a task

`PATCH /tasks/1`

```json
{
  "status": "in_progress",
  "priority": "medium"
}
```

Only supplied fields are updated; a non-empty PATCH updates `updated_at`. The optional `due_date` may be cleared with `null`.

### List, search, filter and sort

```http
GET /tasks?page=1&page_size=10&status=todo&priority=high&sort_by=due_date&order=asc
GET /tasks?q=angular&category=learning
GET /tasks?due_after=2026-11-01T00:00:00Z&due_before=2026-12-01T00:00:00Z
```

| Parameter | Accepted values | Default |
| --- | --- | --- |
| `page` | Integer ≥ 1 | `1` |
| `page_size` | Integer 1–100 | `10` |
| `status` | `todo`, `in_progress`, `completed`, `archived` | All |
| `priority` | `low`, `medium`, `high` | All |
| `category` | `work`, `personal`, `learning`, `health`, `finance`, `other` | All |
| `q` | Search text, max 100 characters | None |
| `due_after` / `due_before` | ISO 8601 datetimes with timezone offsets | None |
| `sort_by` | `created_at`, `due_date` | `created_at` |
| `order` | `asc`, `desc` | `desc` |

**Response contract:** `GET /tasks` currently returns a **JSON array**, not a wrapper with total/page metadata. This preserves compatibility with the existing Angular task service. A future change to pagination metadata should be coordinated with the frontend.

### Task statistics

`GET /tasks/stats`

```json
{
  "total": 12,
  "by_status": {
    "todo": 5,
    "in_progress": 3,
    "completed": 3,
    "archived": 1
  },
  "overdue": 2
}
```

*Example values.* Statistics count tasks across the database rather than just a paginated list. `overdue` counts tasks with a past due date whose status is `todo` or `in_progress`.

### Kanban status retrieval

```http
GET /tasks/by-status/todo
GET /tasks/by-status/in_progress
GET /tasks/by-status/completed
GET /tasks/by-status/archived
```

These endpoints return a **JSON array** of tasks ordered newest first, without pagination. Empty statuses return `[]`, and invalid statuses return HTTP `422`. A bounded or cursor-paginated approach may be needed if task volumes increase.

## Automated Tests

Run from `backend/` in your active Python environment:

```bash
python -m pytest -v
```

**Latest locally reported result (November 14, 2026): 37 passed, 0 failed** using Python 3.12.3 and pytest 9.2.0. This is a reported test result, not a CI badge or code-coverage percentage.

The suite checks CRUD, validation, timestamps, statistics, Kanban retrieval, pagination, filtering, search wildcards, due dates, invalid queries, and updates/deletions reflected in statistics. It also includes a timezone-equivalence scenario. Comprehensive timezone behavior and frontend automated tests remain future hardening tasks.

## Angular Architecture

TaskFlow separates **container (smart) components** from **presentational components**:

```text
TaskListPage (container)
├── TaskStats                 # Current UI; API-backed counts planned
├── TaskFilter                # Filter inputs and change events
├── TaskList                  # Existing list presentation
│   └── TaskCard
├── TaskTable                 # Planned
└── TaskBoard                 # Planned Kanban view
```

The container manages loading, state and API calls; presentational components receive task data through inputs and emit events through outputs. This keeps data access separate from rendering. The planned **List / Table / Board** switcher will reuse the same backend and shared filter state, rather than duplicating business logic.

For a large Kanban board, fetching all tasks for every status would not scale indefinitely; pagination per column can be added later.

## Development Workflow

Use `main` as the integration baseline and create short-lived feature branches for isolated changes:

```text
main
└── feature/backend-task-analytics     # Stats, Kanban APIs, filtering, tests
    └── Pull request → main
```

Typical sequence:

1. Update `main` and create a feature branch.
2. Implement the change and run relevant tests.
3. Commit using a descriptive Conventional Commit message.
4. Push and open a pull request targeting `main`.
5. Review the diff and checks, then merge.
6. Pull the merged `main` before starting the next feature.

Example commits:

```text
feat(api): add task analytics, Kanban endpoints and advanced filtering
test(api): cover analytics, Kanban and advanced filtering
feat(frontend): add task view switcher and table view
docs: update README for backend analytics milestone
```

## Roadmap

### Phase 1 — Backend foundations

- [x] FastAPI, SQLModel and SQLite setup.
- [x] Task CRUD, enums, due dates and timestamps.
- [x] Validation, filters, sorting and pagination.
- [x] Health check and automated API testing.

### Phase 2 — Integrated full stack

- [x] Angular standalone components, routing, responsive layout.
- [x] Task list, cards, filters and statistics UI.
- [x] Reactive create/edit forms with validation.
- [x] Real Angular ↔ FastAPI CRUD integration and SQLite persistence.
- [x] Task list pagination integration.

### Phase 3 — Backend analytics and multi-view UI

- [x] Implement `/tasks/stats` and `/tasks/by-status/{task_status}`.
- [x] Implement title/description search and due-date filtering.
- [x] Pass 37 backend tests locally.
- [ ] Merge backend analytics feature PR into `main` (if not already merged).
- [ ] Connect frontend stats cards to `/tasks/stats`.
- [ ] Add a List / Table / Board view switcher.
- [ ] Build table view with server-side search, filtering and sorting.
- [ ] Build Kanban board grouped by status.
- [ ] Improve loading, empty and error states; add frontend tests.

### V1 release checklist

- [ ] Verify all core views and CRUD flows against the live backend.
- [ ] Review mobile responsiveness, accessibility and API error handling.
- [ ] Run backend tests and frontend production build.
- [ ] Update documentation and release notes.
- [ ] Tag the first stable release as `v1.0.0`.

### After V1 (V2 and beyond)

- Authentication and authorization, users and task ownership.
- Extend task queries and statistics to be scoped to the authenticated user.
- Consider Kanban drag-and-drop, bulk updates and activity history.
- Consider pagination metadata, database migrations, deployment and CI enhancements.

## Versioning

The API currently declares version `1.2.2` during development. This is **not** the public application release tag. The first stable full-stack release is planned as **`v1.0.0`**.

## License

No license has been selected yet. Until one is added, do not assume the repository is offered under an open-source license.

---

**TaskFlow** — Learn software engineering by building, testing and improving a real full-stack application.
