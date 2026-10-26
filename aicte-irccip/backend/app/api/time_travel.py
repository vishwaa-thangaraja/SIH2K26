from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.core.time_travel import TimeTravelEngine

router = APIRouter(prefix="/time-travel", tags=["Time Travel"])

@router.get("/query")
def query_asof_state(
    asof_date: str = Query(..., description="Target historical date/time in ISO format, e.g. '2026-07-15' or '2026-07-15T12:00:00'"),
    basis: str = Query("RECORDED", description="'RECORDED' (system knowledge) or 'WORLD' (real-world event time)"),
    db: Session = Depends(get_db)
):
    try:
        if "T" in asof_date:
            target_dt = datetime.fromisoformat(asof_date)
        else:
            target_dt = datetime.strptime(asof_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD or ISO 8601 string.")

    engine = TimeTravelEngine(db)
    return engine.get_state_asof(target_dt, basis=basis.upper())
