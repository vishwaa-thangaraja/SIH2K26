from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_db
from models.provider import ProviderScorecard, RegionalSkillGap
from typing import List

router = APIRouter()

@router.get("/providers")
def get_providers(db: Session = Depends(get_db)):
    return db.exec(select(ProviderScorecard)).all()

@router.get("/skill-gaps")
def get_skill_gaps(db: Session = Depends(get_db)):
    return db.exec(select(RegionalSkillGap)).all()

@router.get("/policy-insights")
def get_policy_insights():
    return [
        {"title": "Welding Demand Up", "description": "High demand in Pune"},
        {"title": "Retention Drop", "description": "Retail sector retention dropped by 12%"}
    ]

@router.get("/outcome-trends")
def get_outcome_trends():
    return {"months": ["Jan", "Feb", "Mar"], "placements": [120, 150, 180]}
