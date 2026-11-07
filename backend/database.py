
from pathlib import Path

from sqlmodel import SQLModel, Session, create_engine


BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "taskflow.db"

DATABASE_URL = f"sqlite:///{DB_FILE.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
