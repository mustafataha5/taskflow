# TaskFlow — System Architecture

## 1. Overview

TaskFlow is a full-stack task management application built to demonstrate modern software engineering practices, including REST API development, frontend architecture, reactive state management, database persistence, testing, and Git workflows.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| ORM | SQLModel |
| Database | SQLite |
| API Communication | REST / JSON |
| Testing | Pytest (backend) |
| Version Control | Git and GitHub |

## 3. System Architecture

```text
              USER
               |
               v
       Angular Application
       -------------------
       Pages & Components
               |
       TaskStoreService
         (Signals)
               |
        Task API Service
               |
         HTTP / JSON
               |
               v
         FastAPI Backend
       -------------------
         API Endpoints
               |
         SQLModel ORM
               |
               v
         SQLite Database
```

## 4. Frontend Architecture

The frontend follows a feature-based architecture.

Key responsibilities:

- **Pages:** Manage routes and coordinate application workflows.
- **Presentational Components:** Display information and emit user actions.
- **Services:** Communicate with backend APIs.
- **Store:** Manage shared task state using Angular signals.
- **Models:** Define TypeScript interfaces and types.
- **Guards:** Validate route access and parameters.
- **Validators:** Enforce form validation rules.

## 5. Backend Architecture

The backend uses FastAPI with SQLModel for database interaction.

Current capabilities include:

- Create tasks.
- Retrieve individual tasks.
- Retrieve paginated task lists.
- Update tasks.
- Delete tasks.
- Filter and sort tasks.
- Validate request data.
- Automatically generate OpenAPI documentation.
- Run automated API tests.

## 6. Data Model

A task includes:

- ID
- Title
- Description
- Status
- Priority
- Category
- Due date
- Created timestamp
- Updated timestamp

Supported statuses:

- `todo`
- `in_progress`
- `completed`
- `archived`

Supported priorities:

- `low`
- `medium`
- `high`

Supported categories:

- `work`
- `personal`
- `learning`
- `health`
- `finance`
- `other`

## 7. Application Data Flow

1. The user performs an action in Angular.
2. A page or component delegates the operation to the relevant service or store.
3. The API service sends an HTTP request to FastAPI.
4. FastAPI validates the request.
5. SQLModel reads or modifies database records.
6. The backend returns a JSON response.
7. Angular updates its state.
8. The UI reacts to the state changes.

## 8. Planned Improvements

- Task statistics endpoints.
- List, table, and Kanban board views.
- Drag-and-drop task status updates.
- Improved automated testing.
- Authentication after the initial V1 features are complete.

## 9. Engineering Principles

- Separation of concerns.
- Reusable components.
- Type safety.
- Single responsibility.
- Predictable state management.
- API-driven communication.
- Incremental feature development.
- Automated testing.
