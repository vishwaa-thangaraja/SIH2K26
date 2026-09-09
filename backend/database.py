from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager

DATABASE_URL = "sqlite:///./continuum.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    import models.trainee
    import models.outcome
    import models.provider
    import models.verification
    import models.training_intake
    import models.communication
    SQLModel.metadata.create_all(engine)

    from sqlalchemy import text
    with engine.connect() as conn:
        cursor = conn.execute(text("PRAGMA table_info(trainee)"))
        existing_cols = [row[1] for row in cursor.fetchall()]
        new_cols = [
            ("date_of_birth", "DATE"),
            ("gender", "VARCHAR"),
            ("district", "VARCHAR"),
            ("state", "VARCHAR"),
        ]
        for col_name, col_type in new_cols:
            if col_name not in existing_cols:
                conn.execute(text(f"ALTER TABLE trainee ADD COLUMN {col_name} {col_type}"))
        conn.commit()

@contextmanager
def get_session():
    with Session(engine) as session:
        yield session

def get_db():
    with Session(engine) as session:
        yield session
