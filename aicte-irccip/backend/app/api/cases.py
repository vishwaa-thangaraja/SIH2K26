from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.database import get_db
from app.models.schema_models import (
    ComplaintCase, CaseEvent, CanonicalStatus, BureauCell, Officer, Institution,
    CaseInstitutionLink, CaseText, ComplaintCategory, TrackType, District, State, Region
)
from app.models.api_schemas import CaseSummary, CaseEventSchema
from app.core.contradiction import get_latest_case_state
from app.core.sla_engine import compute_sla_metrics

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("", response_model=List[CaseSummary])
def list_cases(
    search: Optional[str] = Query(None, description="Search by Case ID, Ref, Summary, or Institution"),
    bureau: Optional[str] = Query(None, description="Filter by Bureau Code (RB, PGRC, etc.)"),
    status: Optional[str] = Query(None, description="Filter by Status Code"),
    region: Optional[str] = Query(None, description="Filter by Region"),
    category: Optional[str] = Query(None, description="Filter by Category"),
    sla_breached_only: bool = Query(False, description="Filter only SLA breached cases"),
    db: Session = Depends(get_db)
):
    cases = db.query(ComplaintCase).all()
    summaries = []

    for c in cases:
        st, bu = get_latest_case_state(db, c.case_id)
        st_code = st.code if st else "PENDING"
        st_name = st.name if st else "Pending"
        bu_code = bu.code if bu else "UNASSIGNED"
        bu_name = bu.name if bu else "Unassigned"

        link = db.query(CaseInstitutionLink).filter(CaseInstitutionLink.case_id == c.case_id).first()
        inst = db.query(Institution).filter(Institution.inst_id == link.inst_id).first() if link else None
        text_rec = db.query(CaseText).filter(CaseText.case_id == c.case_id).first()

        # Region resolution
        reg_name = "National Jurisdiction"
        if inst and inst.district and inst.district.state and inst.district.state.region:
            reg_name = inst.district.state.region.name

        age_days, aging_bucket, is_breached, next_action = compute_sla_metrics(c.received_on, st_code)

        # Apply Filters
        if bureau and bu_code.upper() != bureau.upper():
            continue
        if status and st_code.upper() != status.upper():
            continue
        if category and c.category and c.category.code.upper() != category.upper():
            continue
        if region and region.lower() not in reg_name.lower():
            continue
        if sla_breached_only and not is_breached:
            continue

        # Search Query Matching
        if search:
            q = search.lower()
            ref_match = q in c.source_ref.lower()
            inst_match = inst and (q in inst.name.lower() or q in inst.permanent_id.lower())
            sum_match = text_rec and (q in text_rec.summary.lower())
            if not (ref_match or inst_match or sum_match):
                continue

        # Officer
        latest_event = (
            db.query(CaseEvent)
            .filter(CaseEvent.case_id == c.case_id, CaseEvent.to_officer_id.isnot(None))
            .order_by(CaseEvent.recorded_at.desc())
            .first()
        )
        off_name = None
        if latest_event and latest_event.to_officer_id:
            off = db.query(Officer).filter(Officer.officer_id == latest_event.to_officer_id).first()
            off_name = off.name if off else None

        summaries.append(CaseSummary(
            case_id=c.case_id,
            source_ref=c.source_ref,
            received_on=c.received_on,
            track_type=c.track_type.name if c.track_type else None,
            category=c.category.name if c.category else "Unclassified",
            priority=c.priority,
            status_code=st_code,
            status_name=st_name,
            bureau_code=bu_code,
            bureau_name=bu_name,
            officer_name=off_name,
            institution_id=inst.inst_id if inst else None,
            institution_pid=inst.permanent_id if inst else None,
            institution_name=inst.name if inst else "Unlinked Institution",
            region_name=reg_name,
            summary=text_rec.summary if text_rec else "",
            age_days=age_days,
            aging_bucket=aging_bucket,
            is_sla_breached=is_breached,
            next_action_due=next_action
        ))

    return summaries

@router.get("/{case_id}/events", response_model=List[CaseEventSchema])
def get_case_events(case_id: int, db: Session = Depends(get_db)):
    events = (
        db.query(CaseEvent)
        .filter(CaseEvent.case_id == case_id)
        .order_by(CaseEvent.recorded_at.desc(), CaseEvent.event_id.desc())
        .all()
    )
    if not events:
        raise HTTPException(status_code=404, detail="Case has no recorded events or does not exist.")

    result = []
    for ev in events:
        st = db.query(CanonicalStatus).filter(CanonicalStatus.status_id == ev.to_status_id).first() if ev.to_status_id else None
        bu = db.query(BureauCell).filter(BureauCell.bureau_id == ev.to_bureau_id).first() if ev.to_bureau_id else None
        off = db.query(Officer).filter(Officer.officer_id == ev.to_officer_id).first() if ev.to_officer_id else None

        result.append(CaseEventSchema(
            event_id=ev.event_id,
            event_type=ev.event_type,
            event_time=ev.event_time,
            recorded_at=ev.recorded_at,
            status_code=st.code if st else None,
            bureau_code=bu.code if bu else None,
            officer_name=off.name if off else None,
            remarks=ev.remarks
        ))

    return result
