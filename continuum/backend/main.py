import os
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from seed_data import seed_all
from routers import trainees, outcomes, evidence, identity, attestation, intelligence, intake, communications

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

origins = [
    "https://sih-2-k26-gz3m.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
app.include_router(intake.router, prefix="/intake", tags=["Training Intake"])
app.include_router(communications.router, prefix="/communications", tags=["Communications"])

@app.get("/")
async def root():
    return {"message": "CONTINUUM API v2.0", "status": "running", "docs": "/docs"}
