from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime
from app.database import get_db
from app.models.schema_models import (
    JointReviewSession, JointReviewCase, BureauCell, Institution, ComplaintCase, Relationship, CaseInstitutionLink, CanonicalStatus
)
from app.models.api_schemas import ContradictionAlert, JointReviewCreate, JointReviewResolve
from app.core.contradiction import ContradictionSentinel

router = APIRouter(prefix="/coordination", tags=["Coordination"])

@router.get("/contradictions", response_model=List[ContradictionAlert])
def get_contradictions(db: Session = Depends(get_db)):
    sentinel = ContradictionSentinel(db)
    return sentinel.scan_contradictions()

@router.get("/overlaps")
def list_overlaps(db: Session = Depends(get_db)):
    rels = db.query(Relationship).all()
    results = []
    for r in rels:
        ca = db.query(ComplaintCase).filter(ComplaintCase.case_id == r.case_a_id).first()
        cb = db.query(ComplaintCase).filter(ComplaintCase.case_id == r.case_b_id).first()
        
        la = db.query(CaseInstitutionLink).filter(CaseInstitutionLink.case_id == r.case_a_id).first() if ca else None
        inst = db.query(Institution).filter(Institution.inst_id == la.inst_id).first() if la else None
        
        # Determine latest statuses and bureaus
        sta = None
        stb = None
        bua = None
        bub = None
        if ca and ca.events:
            for ev in reversed(ca.events):
                if ev.status and not sta:
                    sta = ev.status
                if ev.bureau and not bua:
                    bua = ev.bureau
        if cb and cb.events:
            for ev in reversed(cb.events):
                if ev.status and not stb:
                    stb = ev.status
                if ev.bureau and not bub:
                    bub = ev.bureau

        # Build Coordination Intelligence Layer reasoning
        is_contradiction = (
            (sta and sta.code == "DISPOSED" and stb and stb.code in ("UNDER_PROCESS", "PENDING", "ESCALATED")) or
            (stb and stb.code == "DISPOSED" and sta and sta.code in ("UNDER_PROCESS", "PENDING", "ESCALATED"))
        )
        
        effective_rel_type = "CONTRADICTORY_ACTIONS" if is_contradiction else r.rel_type

        if effective_rel_type == "CONTRADICTORY_ACTIONS":
            why_together = f"Inter-bureau status dissonance: {bua.code if bua else 'Bureau A'} marked case as DISPOSED while {bub.code if bub else 'Bureau B'} has an active disciplinary proceeding for the same institution."
            why_not = "The student grievance might have been genuinely satisfied on fee refund, yet statutory institutional violations may persist independently."
            action = "Mandatory Joint Review: Prevent premature clean-chit from compromising ongoing regulatory show-cause proceedings."
        elif r.rel_type == "DUPLICATE_SUBMISSION":
            why_together = "Near-identical complaint text and matching institutional identifier received within short temporal window."
            why_not = "Complainant may be a different student facing the same institutional fee policy."
            action = "Docket Linking: Merge into parent inquiry without re-triggering parallel departmental notices."
        else: # RELATED_PARALLEL
            why_together = f"Parallel inquiries ongoing in {bua.code if bua else 'Bureau 1'} and {bub.code if bub else 'Bureau 2'} concerning the same verified AICTE institution."
            why_not = "Proceedings address different regulatory mandates (e.g. Student Grievance vs Faculty Ratio Inspection) that can progress independently."
            action = "Cross-Reference Tagging: Notify both bureau inquiry officers so shared inspection findings can be leveraged."

        results.append({
            "rel_id": r.rel_id,
            "institution_name": inst.name if inst else "Unknown Institution",
            "institution_pid": inst.permanent_id if inst else "N/A",
            "case_a_id": r.case_a_id,
            "case_a_ref": ca.source_ref if ca else "N/A",
            "case_a_bureau": bua.code if bua else "N/A",
            "case_a_status": sta.name if sta else "Active",
            "case_b_id": r.case_b_id,
            "case_b_ref": cb.source_ref if cb else "N/A",
            "case_b_bureau": bub.code if bub else "N/A",
            "case_b_status": stb.name if stb else "Active",
            "rel_type": effective_rel_type,
            "tier": r.tier,
            "status": r.status,
            "why_review_together": why_together,
            "why_might_not_need": why_not,
            "justified_action": action,
            "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
        })
    return results

@router.post("/joint-review")
def create_joint_review(payload: JointReviewCreate, db: Session = Depends(get_db)):
    init_bu = db.query(BureauCell).filter(BureauCell.code == payload.initiator_bureau_code.upper()).first()
    target_bu = db.query(BureauCell).filter(BureauCell.code == payload.target_bureau_code.upper()).first()
    if not init_bu or not target_bu:
        raise HTTPException(status_code=400, detail="Invalid bureau code provided.")

    session = JointReviewSession(
        inst_id=payload.institution_id,
        initiator_bureau_id=init_bu.bureau_id,
        target_bureau_id=target_bu.bureau_id,
        coordination_reason=payload.coordination_reason,
        status="IN_CONFERENCE"
    )
    db.add(session)
    db.flush()

    for cid in payload.case_ids:
        db.add(JointReviewCase(session_id=session.session_id, case_id=cid))

    db.commit()
    db.refresh(session)

    return {
        "session_id": session.session_id,
        "status": session.status,
        "message": f"Joint Inter-Bureau Conference convened between {init_bu.code} and {target_bu.code}."
    }

@router.get("/joint-review")
def list_joint_reviews(db: Session = Depends(get_db)):
    sessions = db.query(JointReviewSession).order_by(JointReviewSession.created_at.desc()).all()
    results = []
    for s in sessions:
        inst = db.query(Institution).filter(Institution.inst_id == s.inst_id).first()
        b_init = db.query(BureauCell).filter(BureauCell.bureau_id == s.initiator_bureau_id).first()
        b_targ = db.query(BureauCell).filter(BureauCell.bureau_id == s.target_bureau_id).first()
        cases = [jc.case.source_ref for jc in s.cases if jc.case]

        results.append({
            "session_id": s.session_id,
            "institution_name": inst.name if inst else "Unknown",
            "institution_pid": inst.permanent_id if inst else "N/A",
            "initiator_bureau": b_init.code if b_init else "N/A",
            "target_bureau": b_targ.code if b_targ else "N/A",
            "linked_cases": cases,
            "status": s.status,
            "coordination_reason": s.coordination_reason,
            "outcome_memo": s.outcome_memo,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "resolved_at": s.resolved_at.isoformat() if s.resolved_at else None
        })
    return results

@router.put("/joint-review/{session_id}/resolve")
def resolve_joint_review(session_id: int, payload: JointReviewResolve, db: Session = Depends(get_db)):
    session = db.query(JointReviewSession).filter(JointReviewSession.session_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Joint Review session not found.")

    session.outcome_memo = payload.outcome_memo
    session.status = payload.status
    session.resolved_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    return {"message": "Joint Review session successfully resolved."}
