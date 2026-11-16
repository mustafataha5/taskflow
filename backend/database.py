
import os
from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine


BASE_DIR = Path(__file__).resolve().parent

# Default: local SQLite database
# Docker: DATABASE_URL provided through Compose
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{(BASE_DIR / 'taskflow.db').as_posix()}"
)

# Ensure the database directory exists
if DATABASE_URL.startswith("sqlite:///"):
    db_path = Path(DATABASE_URL.removeprefix("sqlite:///"))
    if db_path.is_absolute():
        db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
