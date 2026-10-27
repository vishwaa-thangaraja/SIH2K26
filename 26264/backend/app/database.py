from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL

# PostgreSQL URL normalization: postgres:// -> postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
pool_kwargs = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Production Cloud PostgreSQL connection pooling (Supabase / Neon / Render / RDS / NIC MeghRaj)
    pool_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": True  # Automatically reconnects dropped cloud connections
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **pool_kwargs,
    echo=False
)

# Enable foreign keys for SQLite when running in local fallback
if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
