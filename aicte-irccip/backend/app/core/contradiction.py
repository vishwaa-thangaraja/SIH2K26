from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.schema_models import (
    ComplaintCase, CaseEvent, CanonicalStatus, BureauCell, Institution, CaseInstitutionLink
)
from app.models.api_schemas import ContradictionAlert

def get_latest_case_state(db: Session, case_id: int) -> Tuple[Optional[CanonicalStatus], Optional[BureauCell]]:
    """
    Derives current status and bureau by finding the most recent non-null event for each,
    exactly matching the case_state_asof SQL logic.
    """
    latest_status_ev = (
        db.query(CaseEvent)
        .filter(CaseEvent.case_id == case_id, CaseEvent.to_status_id.isnot(None))
        .order_by(CaseEvent.recorded_at.desc(), CaseEvent.event_id.desc())
        .first()
    )
    latest_bureau_ev = (
        db.query(CaseEvent)
        .filter(CaseEvent.case_id == case_id, CaseEvent.to_bureau_id.isnot(None))
        .order_by(CaseEvent.recorded_at.desc(), CaseEvent.event_id.desc())
        .first()
    )

    status = (
        db.query(CanonicalStatus).filter(CanonicalStatus.status_id == latest_status_ev.to_status_id).first()
        if latest_status_ev else None
    )
    bureau = (
        db.query(BureauCell).filter(BureauCell.bureau_id == latest_bureau_ev.to_bureau_id).first()
        if latest_bureau_ev else None
    )

    return status, bureau

class ContradictionSentinel:
    def __init__(self, db: Session):
        self.db = db

    def scan_contradictions(self) -> List[ContradictionAlert]:
        """
        Scans all institutions with active cases across multiple bureaus.
        Flags critical contradictions:
        - Bureau A: DISPOSED (Clean-chit/Routine closure)
        - Bureau B: UNDER_PROCESS / PENDING / ESCALATED (Active Show-Cause / Inquest)
        """
        contradictions: List[ContradictionAlert] = []

        institutions = self.db.query(Institution).all()

        for inst in institutions:
            cases = (
                self.db.query(ComplaintCase)
                .join(CaseInstitutionLink)
                .filter(CaseInstitutionLink.inst_id == inst.inst_id)
                .all()
            )

            if len(cases) < 2:
                continue

            case_states = []
            for c in cases:
                st, bu = get_latest_case_state(self.db, c.case_id)
                if st and bu:
                    case_states.append({
                        "case_id": c.case_id,
                        "source_ref": c.source_ref,
                        "status_code": st.code,
                        "bureau_id": bu.bureau_id,
                        "bureau_code": bu.code,
                    })

            # Check pairwise cross-bureau states
            for i in range(len(case_states)):
                for j in range(i + 1, len(case_states)):
                    c1 = case_states[i]
                    c2 = case_states[j]

                    if c1["bureau_id"] == c2["bureau_id"]:
                        continue  # Same bureau

                    active_statuses = {"UNDER_PROCESS", "PENDING", "ESCALATED"}
                    is_c1_disposed_c2_active = (c1["status_code"] == "DISPOSED" and c2["status_code"] in active_statuses)
                    is_c2_disposed_c1_active = (c2["status_code"] == "DISPOSED" and c1["status_code"] in active_statuses)

                    if is_c1_disposed_c2_active or is_c2_disposed_c1_active:
                        disposed_case = c1 if c1["status_code"] == "DISPOSED" else c2
                        active_case = c2 if c1["status_code"] == "DISPOSED" else c1

                        alert = ContradictionAlert(
                            institution_id=inst.inst_id,
                            permanent_id=inst.permanent_id,
                            institution_name=inst.name,
                            bureau_a_case_id=disposed_case["case_id"],
                            bureau_a_ref=disposed_case["source_ref"],
                            bureau_a_code=disposed_case["bureau_code"],
                            bureau_a_status=disposed_case["status_code"],
                            bureau_b_case_id=active_case["case_id"],
                            bureau_b_ref=active_case["source_ref"],
                            bureau_b_code=active_case["bureau_code"],
                            bureau_b_status=active_case["status_code"],
                            severity="CRITICAL_REGULATORY_CONTRADICTION",
                            warning_message=(
                                f"Administrative Dissonance: {disposed_case['bureau_code']} marked case {disposed_case['source_ref']} as DISPOSED, "
                                f"while {active_case['bureau_code']} maintains active proceeding {active_case['source_ref']} ({active_case['status_code']}). "
                                "High Court/RTI vulnerability. Inter-bureau Joint Conference mandatory before order dispatch."
                            )
                        )
                        contradictions.append(alert)

        return contradictions
