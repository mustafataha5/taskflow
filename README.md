# TaskFlow

**TaskFlow** is a full-stack task management application built with FastAPI, SQLModel, SQLite, and Angular.

The project is designed to demonstrate REST API development, database management, frontend integration, automated testing, and professional Git/GitHub workflows.

**Project Status:** 🚧 V1 — In Development (Backend implemented, frontend planned)

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Python, FastAPI |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Database | SQLite |
| Frontend (Planned) | Angular, TypeScript, Tailwind CSS |
| Testing | pytest, FastAPI TestClient, HTTPX |
| Version Control | Git, GitHub |

## Features

### Backend — Implemented

- Create, retrieve, update, and delete tasks
- Task priority: Low, Medium, High
- Task category: Work, Personal, Learning
- Task completion tracking
- Optional task due dates
- Automatic creation and modification timestamps
- Pagination for task listings
- Filtering by priority, category, and completion status
- Sorting by creation date or due date
- Input validation with Pydantic
- HTTP error handling
- Health check endpoint
- Automated API tests

### Frontend — Planned

- Responsive Angular dashboard
- Task listing and management
- Reactive forms with validation
- Priority and category filters
- Search and sorting controls
- Loading and error states
- Integration with FastAPI REST endpoints
- Tailwind CSS styling

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
├── frontend/                 # Angular application (planned)
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.11 or newer
- pip
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mustafataha5/taskflow.git
cd taskflow
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Set up the backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

For Windows:

```powershell
.venv\Scripts\activate
```

### 3. Start the API

```bash
uvicorn main:app --reload
```

The API runs at:

`http://127.0.0.1:8000`

FastAPI automatically provides interactive documentation:

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI specification: `http://127.0.0.1:8000/openapi.json`

The SQLite database is initialized automatically when the application starts.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/tasks` | List, filter, sort and paginate tasks |
| GET | `/tasks/{task_id}` | Retrieve a task by ID |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/{task_id}` | Partially update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

### Example: Create a Task

**POST** `/tasks`

```json
{
  "title": "Learn Angular",
  "description": "Practice RxJS and Signals",
  "priority": "high",
  "category": "learning",
  "due_date": "2026-12-01T18:00:00Z"
}
```

Example response (HTTP 201):

```json
{
  "id": 1,
  "title": "Learn Angular",
  "description": "Practice RxJS and Signals",
  "completed": false,
  "priority": "high",
  "category": "learning",
  "due_date": "2026-12-01T18:00:00Z",
  "created_at": "2026-11-07T18:00:00Z",
  "updated_at": "2026-11-07T18:00:00Z"
}
```

### Example: Update a Task

**PATCH** `/tasks/1`

```json
{
  "completed": true,
  "priority": "medium"
}
```

Only the supplied fields are updated. The `updated_at` timestamp is refreshed for non-empty PATCH requests.

### Filtering, Sorting and Pagination

Example request:

```http
GET /tasks?page=1&page_size=10&priority=high&category=learning&sort_by=due_date&order=asc
```

Supported query parameters:

| Parameter | Description | Default |
|---|---|---|
| `page` | Page number, starting at 1 | `1` |
| `page_size` | Records per page, maximum 100 | `10` |
| `priority` | Filter by low, medium or high | All |
| `category` | Filter by work, personal or learning | All |
| `completed` | Filter by true or false | All |
| `sort_by` | `created_at` or `due_date` | `created_at` |
| `order` | `asc` or `desc` | `desc` |

The endpoint currently returns a JSON array of tasks.

## Automated Testing

The backend uses pytest and FastAPI TestClient for automated API tests.

Run the tests from the `backend` directory:

```bash
python -m pytest -v
```

The test suite covers:

- Health check
- Task creation and retrieval
- Task updates and timestamps
- Task deletion
- Missing-task error handling
- Invalid input validation
- Pagination
- Filtering
- Sorting

**Latest local result:** 14 tests passed.

Tests use an isolated in-memory SQLite database for task operations.

## Development Workflow

TaskFlow uses feature branches and pull requests.

```text
main
  |
  +-- feature/backend-crud
  |
  +-- feature/angular-frontend (planned)
  |
  +-- future feature branches
```

Development workflow:

1. Create a feature branch from `main`.
2. Implement and test the feature.
3. Commit changes with descriptive commit messages.
4. Push the branch to GitHub.
5. Open a Pull Request.
6. Review and merge changes into `main`.
7. Delete the merged feature branch when no longer needed.

### Commit Naming

The project follows Conventional Commit naming conventions.

```text
feat: add new functionality
fix: resolve a bug
test: add or update tests
docs: update documentation
chore: maintain project configuration
refactor: improve code without changing behavior
```

## Roadmap

- [x] FastAPI backend and SQLite database
- [x] Task CRUD operations
- [x] Priority, category, due date and timestamps
- [x] Pagination, filtering and sorting
- [x] Automated backend tests
- [ ] Angular frontend initialization
- [ ] Angular components and task management pages
- [ ] FastAPI integration through Angular services
- [ ] Reactive forms, Signals and RxJS
- [ ] Responsive UI with Tailwind CSS
- [ ] Full-stack testing and V1 release

## Versioning

TaskFlow will use Git tags and GitHub Releases.

The first stable full-stack release will be tagged:

`v1.0.0`

Future changes will follow Semantic Versioning where applicable.

## License

No license has been selected yet.

---

**TaskFlow** — A hands-on full-stack engineering project focused on building maintainable software and practicing real-world development workflows.