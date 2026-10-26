from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.seed.init_db import init_database
from app.api.dashboard import router as dashboard_router
from app.api.cases import router as cases_router
from app.api.coordination import router as coordination_router
from app.api.time_travel import router as time_travel_router
from app.api.entity import router as entity_router
from app.api.ml import router as ml_router
from app.api.auth import router as auth_router
from app.api.intake import router as intake_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and seed records on startup
    init_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(cases_router, prefix=settings.API_PREFIX)
app.include_router(coordination_router, prefix=settings.API_PREFIX)
app.include_router(time_travel_router, prefix=settings.API_PREFIX)
app.include_router(entity_router, prefix=settings.API_PREFIX)
app.include_router(ml_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(intake_router, prefix=settings.API_PREFIX)

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs"
    }
