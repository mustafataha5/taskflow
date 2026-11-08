
from datetime import datetime, timezone
from enum import Enum

from pydantic import AwareDatetime, ConfigDict, field_validator
from sqlmodel import SQLModel, Field


# -----------------------------------
# 1. ENUMS
# -----------------------------------

class Status(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Category(str, Enum):
    WORK = "work"
    PERSONAL = "personal"
    LEARNING = "learning"
    HEALTH = "health"
    FINANCE = "finance"
    OTHER = "other"


# -----------------------------------
# 2. BASE MODEL
# -----------------------------------

class TaskBase(SQLModel):
    title: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=500)

    status: Status = Status.TODO

    priority: Priority = Priority.MEDIUM
    category: Category = Category.PERSONAL

    due_date: AwareDatetime | None = None


# -----------------------------------
# 3. DATABASE TABLE
# -----------------------------------

class Task(TaskBase, table=True):
    id: int | None = Field(
        default=None,
        primary_key=True
    )

    created_at: AwareDatetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: AwareDatetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


# -----------------------------------
# 4. CREATE TASK - POST
# -----------------------------------

class TaskCreate(TaskBase):
    model_config = ConfigDict(extra="forbid")


# -----------------------------------
# 5. UPDATE TASK - PATCH
# -----------------------------------

class TaskUpdate(SQLModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    status: Status | None = None
    priority: Priority | None = None
    category: Category | None = None
    due_date: AwareDatetime | None = None

    @field_validator(
        "title",
        "description",
        "status",
        "priority",
        "category"
    )
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("This field cannot be null")
        return value


# -----------------------------------
# 6. RESPONSE MODEL
# -----------------------------------

class TaskRead(TaskBase):
    id: int
    created_at: AwareDatetime
    updated_at: AwareDatetime
