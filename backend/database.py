from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager

DATABASE_URL = "sqlite:///./continuum.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@contextmanager
def get_session():
    with Session(engine) as session:
        yield session

def get_db():
    with Session(engine) as session:
        yield session
