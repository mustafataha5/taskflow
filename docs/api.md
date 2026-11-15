# TaskFlow — REST API Documentation

## 1. Overview

TaskFlow provides a RESTful API for task management using FastAPI, SQLModel, and SQLite.

**Local Base URL:** `http://localhost:8000`

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| GET | `/tasks` | Retrieve tasks with pagination, filters, search, and sorting |
| GET | `/tasks/stats` | Retrieve database-wide task statistics |
| GET | `/tasks/by-status/{task_status}` | Retrieve all tasks for a specified status |
| GET | `/tasks/{task_id}` | Retrieve a single task |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/{task_id}` | Partially update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

## 3. Task Retrieval

### GET `/tasks`

Retrieve tasks with optional query parameters for:

- Pagination
- Status filtering
- Priority filtering
- Category filtering
- Text search (`q`)
- Due-date range filtering
- Sorting

The current endpoint returns a JSON array of tasks rather than a pagination metadata envelope.

### GET `/tasks/{task_id}`

Retrieve a specific task by its numeric ID.

## 4. Task Management

### POST `/tasks`

Create a new task using a validated JSON request body.

### PATCH `/tasks/{task_id}`

Update selected fields of an existing task.

This endpoint also supports changing a task's status, which can be used by the planned Kanban drag-and-drop feature.

### DELETE `/tasks/{task_id}`

Permanently delete a task.

**Successful response:** `204 No Content`

## 5. Task Statistics

### GET `/tasks/stats`

Returns database-wide statistics independently of frontend pagination.

Example response structure:

```json
{
  "total": 24,
  "by_status": {
    "todo": 8,
    "in_progress": 4,
    "completed": 10,
    "archived": 2
  },
  "overdue": 3
}
```

The numbers above are illustrative, not live database values.

## 6. Tasks by Status

### GET `/tasks/by-status/{task_status}`

Returns a non-paginated JSON array of tasks matching the requested status, ordered newest first.

Valid statuses:

- `todo`
- `in_progress`
- `completed`
- `archived`

Example:

```http
GET /tasks/by-status/in_progress
```

An invalid task status returns HTTP `422`.

## 7. Task Fields

| Field | Description |
|---|---|
| `id` | Unique task identifier |
| `title` | Task title |
| `description` | Task description |
| `status` | Task workflow status |
| `priority` | Low, medium, or high |
| `category` | Task category |
| `due_date` | Scheduled due date |
| `created_at` | Creation timestamp |
| `updated_at` | Last modification timestamp |

## 8. Testing

**Last verified:** November 14, 2026

- Backend tests: **37 passed**
- Failed tests: **0**
- CRUD endpoints tested
- Statistics endpoint tested
- Status-based task retrieval tested

## 9. Frontend Integration Status

Completed:

- Task CRUD integration
- Task retrieval and filtering
- Pagination support

Next:

- Connect database-wide statistics to Angular dashboard cards
- Implement task table view
- Implement Kanban board view
- Add drag-and-drop status updates

## 10. API Development Guidelines

- Follow RESTful conventions.
- Validate input using Pydantic/SQLModel.
- Use appropriate HTTP status codes.
- Keep database access separated from frontend logic.
- Maintain automated tests for new endpoints.
- Update this document whenever API behavior changes.
