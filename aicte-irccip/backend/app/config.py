import os
from pathlib import Path
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "data.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AICTE Integrated Case Coordination Platform")
    PROJECT_VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
