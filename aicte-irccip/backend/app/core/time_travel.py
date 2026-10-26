import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema_models import (
    ComplaintCase, CaseEvent, CanonicalStatus, BureauCell, Institution, CaseInstitutionLink, CaseText
)

class TimeTravelEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_state_asof(self, asof_dt: datetime.datetime, basis: str = "RECORDED") -> Dict[str, Any]:
        """
        Bitemporal state reconstruction as of asof_dt.
        basis:
          - 'RECORDED': System knowledge time (recorded_at <= asof_dt).
          - 'WORLD': Real-world event occurrence time (event_time <= asof_dt AND recorded_at <= asof_dt).
        """
        if basis == "RECORDED":
            event_filter = CaseEvent.recorded_at <= asof_dt
        else:
            # Correction-aware WORLD time: event must have happened by asof_dt AND been known by asof_dt
            event_filter = (CaseEvent.event_time <= asof_dt) & (CaseEvent.recorded_at <= asof_dt)

        # Get all events known up to asof_dt
        known_events = (
            self.db.query(CaseEvent)
            .filter(event_filter)
            .order_by(CaseEvent.case_id, CaseEvent.recorded_at.asc(), CaseEvent.event_id.asc())
            .all()
        )

        # Build latest state per case
        case_map: Dict[int, Dict[str, Any]] = {}
        for ev in known_events:
            if ev.case_id not in case_map:
                case_map[ev.case_id] = {
                    "case_id": ev.case_id,
                    "status_id": ev.to_status_id,
                    "bureau_id": ev.to_bureau_id,
                    "officer_id": ev.to_officer_id,
                    "last_event_time": ev.event_time,
                    "last_recorded_at": ev.recorded_at,
                    "last_remarks": ev.remarks,
                }
            else:
                if ev.to_status_id is not None:
                    case_map[ev.case_id]["status_id"] = ev.to_status_id
                if ev.to_bureau_id is not None:
                    case_map[ev.case_id]["bureau_id"] = ev.to_bureau_id
                if ev.to_officer_id is not None:
                    case_map[ev.case_id]["officer_id"] = ev.to_officer_id
                case_map[ev.case_id]["last_event_time"] = ev.event_time
                case_map[ev.case_id]["last_recorded_at"] = ev.recorded_at
                if ev.remarks:
                    case_map[ev.case_id]["last_remarks"] = ev.remarks

        # Also fetch all chronological events for the visual timeline sliding window
        all_events_raw = (
            self.db.query(CaseEvent)
            .order_by(CaseEvent.event_time.asc())
            .all()
        )
        timeline_milestones = []
        for ev in all_events_raw:
            case = self.db.query(ComplaintCase).filter(ComplaintCase.case_id == ev.case_id).first()
            status = self.db.query(CanonicalStatus).filter(CanonicalStatus.status_id == ev.to_status_id).first() if ev.to_status_id else None
            bureau = self.db.query(BureauCell).filter(BureauCell.bureau_id == ev.to_bureau_id).first() if ev.to_bureau_id else None
            link = self.db.query(CaseInstitutionLink).filter(CaseInstitutionLink.case_id == ev.case_id).first()
            inst = self.db.query(Institution).filter(Institution.inst_id == link.inst_id).first() if link else None

            ev_time_str = ev.event_time.strftime("%Y-%m-%d") if ev.event_time else ""
            rec_time_str = ev.recorded_at.strftime("%Y-%m-%d") if ev.recorded_at else ""

            # Check if this event was known as of asof_dt
            is_active_at_asof = False
            if basis == "RECORDED":
                is_active_at_asof = ev.recorded_at <= asof_dt if ev.recorded_at else False
            else:
                is_active_at_asof = (ev.event_time <= asof_dt) and (ev.recorded_at <= asof_dt)

            timeline_milestones.append({
                "event_id": ev.event_id,
                "case_id": ev.case_id,
                "case_ref": case.source_ref if case else f"CASE-{ev.case_id}",
                "institution_name": inst.name if inst else "Unknown",
                "bureau_code": bureau.code if bureau else "AICTE",
                "bureau_name": bureau.name if bureau else "Central Cell",
                "status_code": status.code if status else "UPDATE",
                "status_name": status.name if status else "Status Update",
                "event_type": ev.event_type,
                "event_date": ev_time_str,
                "recorded_date": rec_time_str,
                "remarks": ev.remarks,
                "is_known_at_asof": is_active_at_asof
            })

        reconstructed_cases = []
        kpis = {
            "total_cases": len(case_map),
            "pending": 0,
            "under_process": 0,
            "disposed": 0,
            "escalated": 0,
            "transferred": 0,
        }

        # Check for conflicts at this historical date
        conflict_detected = False
        conflict_summary = None

        mepco_cases = {}

        for case_id, st in case_map.items():
            case = self.db.query(ComplaintCase).filter(ComplaintCase.case_id == case_id).first()
            if not case:
                continue

            status = self.db.query(CanonicalStatus).filter(CanonicalStatus.status_id == st["status_id"]).first()
            bureau = self.db.query(BureauCell).filter(BureauCell.bureau_id == st["bureau_id"]).first()
            
            link = self.db.query(CaseInstitutionLink).filter(CaseInstitutionLink.case_id == case_id).first()
            inst = self.db.query(Institution).filter(Institution.inst_id == link.inst_id).first() if link else None
            text_rec = self.db.query(CaseText).filter(CaseText.case_id == case_id).first()

            status_code = status.code if status else "UNKNOWN"
            bureau_code = bureau.code if bureau else "UNKNOWN"

            if status_code == "PENDING":
                kpis["pending"] += 1
            elif status_code == "UNDER_PROCESS":
                kpis["under_process"] += 1
            elif status_code == "DISPOSED":
                kpis["disposed"] += 1
            elif status_code == "ESCALATED":
                kpis["escalated"] += 1
            elif status_code == "TRANSFERRED":
                kpis["transferred"] += 1

            # Check conflict specifically for institutions with multiple cases
            if inst:
                if inst.inst_id not in mepco_cases:
                    mepco_cases[inst.inst_id] = []
                mepco_cases[inst.inst_id].append({
                    "bureau": bureau_code,
                    "status": status_code,
                    "case_ref": case.source_ref,
                    "inst_name": inst.name
                })

            reconstructed_cases.append({
                "case_id": case.case_id,
                "source_ref": case.source_ref,
                "received_on": str(case.received_on),
                "status_code": status_code,
                "status_name": status.name if status else "Unknown",
                "bureau_code": bureau_code,
                "bureau_name": bureau.name if bureau else "Unknown",
                "institution_name": inst.name if inst else "Unlinked",
                "institution_pid": inst.permanent_id if inst else "N/A",
                "summary": text_rec.summary if text_rec else "",
                "last_event_time": st["last_event_time"].isoformat() if st["last_event_time"] else None,
                "last_recorded_at": st["last_recorded_at"].isoformat() if st["last_recorded_at"] else None,
                "remarks": st["last_remarks"]
            })

        for inst_id, c_list in mepco_cases.items():
            has_disposed = any(c["status"] == "DISPOSED" for c in c_list)
            has_active = any(c["status"] in ("UNDER_PROCESS", "PENDING", "ESCALATED") for c in c_list)
            bureaus_involved = set(c["bureau"] for c in c_list)
            if has_disposed and has_active and len(bureaus_involved) > 1:
                conflict_detected = True
                conflict_summary = f"Regulatory Conflict active as of this date: One bureau marked docket DISPOSED while another has an active proceeding for {c_list[0]['inst_name']}."
                break

        return {
            "asof_timestamp": asof_dt.strftime("%Y-%m-%d"),
            "basis": basis,
            "kpis": kpis,
            "active_case_count": len(reconstructed_cases),
            "cases": reconstructed_cases,
            "timeline_milestones": timeline_milestones,
            "conflict_detected": conflict_detected,
            "conflict_summary": conflict_summary
        }
