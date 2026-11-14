from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import (
    FastAPI, Depends, HTTPException, Query, status
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlmodel import Session, select, col

from database import create_db_and_tables, get_session
from models import (
    Task, TaskCreate, TaskRead, TaskUpdate, TaskStatsRead,
    Priority, Category, Status
)


# -----------------------------------
# APPLICATION LIFESPAN
# -----------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="TaskFlow API",
    version="1.2.2",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SessionDep = Annotated[Session, Depends(get_session)]


# -----------------------------------
# HEALTH CHECK
# -----------------------------------

@app.get("/health")
def health_check():
    return {"status": "ok"}


# -----------------------------------
# TASK STATISTICS
# -----------------------------------

@app.get("/tasks/stats", response_model=TaskStatsRead)
def get_task_stats(session: SessionDep):
    # Count tasks grouped by status in the database.
    statement = (
        select(Task.status, func.count(Task.id))
        .group_by(Task.status)
    )

    results = session.exec(statement).all()

    # Include every status, even when its count is zero.
    by_status = {status.value: 0 for status in Status}

    for task_status, count in results:
        status_key = (
            task_status.value
            if isinstance(task_status, Status)
            else task_status
        )
        by_status[status_key] = count

    # Overdue: due date passed and task is unfinished.
    overdue_statement = (
        select(func.count(Task.id))
        .where(Task.due_date < datetime.now(timezone.utc))
        .where(
            col(Task.status).in_([
                Status.TODO,
                Status.IN_PROGRESS
            ])
        )
    )

    overdue = session.exec(overdue_statement).one()

    return {
        "total": sum(by_status.values()),
        "by_status": by_status,
        "overdue": overdue
    }


# -----------------------------------
# KANBAN TASKS BY STATUS
# -----------------------------------

@app.get(
    "/tasks/by-status/{task_status}",
    response_model=list[TaskRead]
)
def get_tasks_by_status(
    task_status: Status,
    session: SessionDep
):
    statement = (
        select(Task)
        .where(Task.status == task_status)
        .order_by(
            col(Task.created_at).desc(),
            col(Task.id).desc()
        )
    )

    return session.exec(statement).all()


# -----------------------------------
# GET TASKS: PAGINATION/FILTER/SORT/SEARCH
# -----------------------------------

@app.get("/tasks", response_model=list[TaskRead])
def get_tasks(
    session: SessionDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    priority: Priority | None = None,
    category: Category | None = None,
    task_status: Status | None = Query(default=None, alias="status"),
    q: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    due_before: datetime | None = None,
    due_after: datetime | None = None,
    sort_by: Literal[
        "created_at", "due_date"
    ] = "created_at",
    order: Literal["asc", "desc"] = "desc",
):
    statement = select(Task)

    # Filtering by priority, category, status
    if priority is not None:
        statement = statement.where(
            Task.priority == priority
        )

    if category is not None:
        statement = statement.where(
            Task.category == category
        )

    if task_status is not None:
        statement = statement.where(
            Task.status == task_status
        )

    # Search title or description with SQL wildcard escaping
    if q and q.strip():
        cleaned = (
            q.strip()
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
        )

        search_term = f"%{cleaned}%"

        statement = statement.where(
            or_(
                col(Task.title).ilike(
                    search_term,
                    escape="\\"
                ),
                col(Task.description).ilike(
                    search_term,
                    escape="\\"
                )
            )
        )

    # Due-date validation and filtering
    if due_after is not None and due_after.tzinfo is None:
        raise HTTPException(
            status_code=422,
            detail="due_after must include a timezone"
        )

    if due_before is not None and due_before.tzinfo is None:
        raise HTTPException(
            status_code=422,
            detail="due_before must include a timezone"
        )

    if (
        due_after is not None
        and due_before is not None
        and due_after > due_before
    ):
        raise HTTPException(
            status_code=422,
            detail="Invalid due-date range"
        )

    if due_after is not None:
        statement = statement.where(
            Task.due_date >= due_after
        )

    if due_before is not None:
        statement = statement.where(
            Task.due_date <= due_before
        )

    # Sorting
    sort_column = {
        "created_at": Task.created_at,
        "due_date": Task.due_date
    }[sort_by]

    if order == "asc":
        statement = statement.order_by(
            sort_column.asc(), Task.id.asc()
        )
    else:
        statement = statement.order_by(
            sort_column.desc(), Task.id.desc()
        )

    # Pagination
    offset = (page - 1) * page_size

    statement = statement.offset(offset).limit(page_size)

    return session.exec(statement).all()


# -----------------------------------
# GET TASK BY ID
# -----------------------------------

@app.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: SessionDep):
    task = session.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# -----------------------------------
# CREATE TASK
# -----------------------------------

@app.post(
    "/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED
)
def create_task(data: TaskCreate, session: SessionDep):
    task = Task.model_validate(data)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


# -----------------------------------
# PARTIAL UPDATE
# -----------------------------------

@app.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    data: TaskUpdate,
    session: SessionDep
):
    task = session.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    updates = data.model_dump(exclude_unset=True)

    non_nullable = {
        "title",
        "description",
        "status",
        "priority",
        "category"
    }

    if any(
        key in non_nullable and value is None
        for key, value in updates.items()
    ):
        raise HTTPException(
            status_code=422,
            detail="These fields cannot be null"
        )

    if not updates:
        return task

    task.sqlmodel_update(updates)
    task.updated_at = datetime.now(timezone.utc)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


# -----------------------------------
# DELETE TASK
# -----------------------------------

@app.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_task(task_id: int, session: SessionDep):
    task = session.get(Task, task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()