
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import (
    FastAPI, Depends, HTTPException, Query, status
)
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import (
    Task, TaskCreate, TaskRead, TaskUpdate,
    Priority, Category
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="TaskFlow API",
    version="1.0.0",
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
# GET TASKS: PAGINATION/FILTER/SORT
# -----------------------------------

@app.get("/tasks", response_model=list[TaskRead])
def get_tasks(
    session: SessionDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 10,
    priority: Priority | None = None,
    category: Category | None = None,
    completed: bool | None = None,
    sort_by: Literal[
        "created_at", "due_date"
    ] = "created_at",
    order: Literal["asc", "desc"] = "desc",
):

    statement = select(Task)

    # Filtering
    if priority is not None:
        statement = statement.where(
            Task.priority == priority
        )

    if category is not None:
        statement = statement.where(
            Task.category == category
        )

    if completed is not None:
        statement = statement.where(
            Task.completed == completed
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
        "completed",
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
