from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from seed_data import seed_all
from routers import trainees, outcomes, evidence, identity, attestation, intelligence

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_all()
    yield

app = FastAPI(
    title="CONTINUUM API",
    description="SIH 26135 — Longitudinal Trainee Outcome Tracking Platform",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trainees.router, prefix="/trainees", tags=["Trainees"])
app.include_router(outcomes.router, prefix="/outcomes", tags=["Outcomes"])
app.include_router(evidence.router, prefix="/evidence", tags=["Evidence"])
app.include_router(identity.router, prefix="/identity", tags=["Identity"])
app.include_router(attestation.router, prefix="/attestation", tags=["Attestation"])
app.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])

@app.get("/")
async def root():
    return {"message": "CONTINUUM API v2.0", "status": "running", "docs": "/docs"}
