import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.schema_models import (
    Region, State, District, BureauCell, Officer, CanonicalStatus, TrackType,
    ComplaintCategory, Institution, InstitutionUnit, InstitutionNameVariant,
    ComplaintCase, CaseText, CaseInstitutionLink, CaseEvent, Relationship, Alert,
    JointReviewSession, JointReviewCase
)

def init_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    if db.query(Region).first():
        print("Database already contains data. Skipping re-seed.")
        db.close()
        return

    print("Seeding initial AICTE IRCCIP database...")

    # 1. Geography
    sro = Region(name="Southern Regional Office (SRO)")
    nro = Region(name="Northern Regional Office (NRO)")
    wro = Region(name="Western Regional Office (WRO)")
    db.add_all([sro, nro, wro])
    db.flush()

    tn = State(name="Tamil Nadu", region_id=sro.region_id)
    up = State(name="Uttar Pradesh", region_id=nro.region_id)
    mh = State(name="Maharashtra", region_id=wro.region_id)
    db.add_all([tn, up, mh])
    db.flush()

    dist_vnr = District(name="Virudhunagar", state_id=tn.state_id)
    dist_cbe = District(name="Coimbatore", state_id=tn.state_id)
    dist_chn = District(name="Chennai", state_id=tn.state_id)
    dist_knp = District(name="Kanpur Nagar", state_id=up.state_id)
    dist_pune = District(name="Pune", state_id=mh.state_id)
    db.add_all([dist_vnr, dist_cbe, dist_chn, dist_knp, dist_pune])
    db.flush()

    # 2. Bureaus
    rb = BureauCell(code="RB", name="Regulation Bureau", kind="BUREAU")
    pgrc = BureauCell(code="PGRC", name="Public Grievance Redressal Cell", kind="CELL")
    appr = BureauCell(code="APPROVAL", name="Approval Bureau", kind="BUREAU")
    vig = BureauCell(code="VIGILANCE", name="Chief Vigilance Cell", kind="CELL")
    db.add_all([rb, pgrc, appr, vig])
    db.flush()

    # 3. Officers
    off_rb = Officer(name="Dr. K. Ramanathan", bureau_id=rb.bureau_id, designation="Adviser & Bureau Head", email="adviser.rb@aicte-india.org")
    off_pgrc = Officer(name="Smt. Anita Sharma", bureau_id=pgrc.bureau_id, designation="Director (PGRC)", email="director.pgrc@aicte-india.org")
    off_sro = Officer(name="Shri V. Anand", bureau_id=rb.bureau_id, designation="Regional Nodal Officer", email="ro.sro@aicte-india.org")
    db.add_all([off_rb, off_pgrc, off_sro])
    db.flush()

    # 4. Statuses
    st_pend = CanonicalStatus(code="PENDING", name="Pending Scrutiny")
    st_proc = CanonicalStatus(code="UNDER_PROCESS", name="Under Active Process / Inquiry")
    st_disp = CanonicalStatus(code="DISPOSED", name="Disposed / Order Passed")
    st_trans = CanonicalStatus(code="TRANSFERRED", name="Transferred to Other Bureau")
    st_esc = CanonicalStatus(code="ESCALATED", name="Escalated to Competent Authority")
    db.add_all([st_pend, st_proc, st_disp, st_trans, st_esc])
    db.flush()

    # 5. Track Types
    tr_comp = TrackType(code="PGRC_COMPLAINT", name="Student / Citizen Grievance")
    tr_sc = TrackType(code="SHOW_CAUSE", name="Statutory Show-Cause Notice")
    tr_evc = TrackType(code="EVC_SCRUTINY", name="Expert Visit Committee Inspection")
    tr_cp = TrackType(code="CPGRAMS", name="Centralized CPGRAMS Petition")
    db.add_all([tr_comp, tr_sc, tr_evc, tr_cp])
    db.flush()

    # 6. Categories
    cat_fees = ComplaintCategory(code="FEES", name="Capitation & Unapproved Fees")
    cat_fac = ComplaintCategory(code="FACULTY", name="Faculty Cadre & Salary Deficit")
    cat_infra = ComplaintCategory(code="INFRASTRUCTURE", name="Laboratory & Campus Infrastructure")
    cat_adm = ComplaintCategory(code="ADMISSION", name="Admission & Quota Irregularities")
    cat_exam = ComplaintCategory(code="EXAMINATION", name="Examination & Certificate Issues")
    cat_other = ComplaintCategory(code="OTHER", name="General Harassment & Other")
    db.add_all([cat_fees, cat_fac, cat_infra, cat_adm, cat_exam, cat_other])
    db.flush()

    # 7. Institutions & Aliases
    inst_mepco = Institution(
        permanent_id="1-1049281721",
        name="Mepco Schlenk Engineering College",
        district_id=dist_vnr.district_id,
        address="Mepco Engineering College Post, Sivakasi",
        pincode="626005"
    )
    inst_psg = Institution(
        permanent_id="1-2819203811",
        name="PSG College of Technology",
        district_id=dist_cbe.district_id,
        address="Avinashi Road, Peelamedu, Coimbatore",
        pincode="641004"
    )
    inst_ceg = Institution(
        permanent_id="1-3928102918",
        name="College of Engineering Guindy, Anna University",
        district_id=dist_chn.district_id,
        address="Sardar Patel Road, Guindy, Chennai",
        pincode="600025"
    )
    inst_hbtu = Institution(
        permanent_id="1-4820192831",
        name="Harcourt Butler Technical University",
        district_id=dist_knp.district_id,
        address="Nawabganj, Kanpur",
        pincode="208002"
    )
    db.add_all([inst_mepco, inst_psg, inst_ceg, inst_hbtu])
    db.flush()

    # Aliases
    db.add_all([
        InstitutionNameVariant(inst_id=inst_mepco.inst_id, alias="Mepco Engg"),
        InstitutionNameVariant(inst_id=inst_mepco.inst_id, alias="MSEC Sivakasi"),
        InstitutionNameVariant(inst_id=inst_mepco.inst_id, alias="Mepco College of Tech"),
        InstitutionNameVariant(inst_id=inst_psg.inst_id, alias="PSG Tech"),
        InstitutionNameVariant(inst_id=inst_psg.inst_id, alias="PSG Coll of Engineering"),
        InstitutionNameVariant(inst_id=inst_ceg.inst_id, alias="CEG Anna University"),
        InstitutionNameVariant(inst_id=inst_ceg.inst_id, alias="Guindy Engg College"),
        InstitutionNameVariant(inst_id=inst_hbtu.inst_id, alias="HBTU Kanpur"),
        InstitutionNameVariant(inst_id=inst_hbtu.inst_id, alias="HBTI"),
    ])
    db.flush()

    # 8. Demonstration Cases (The Contradiction & Overlap Showpiece)
    # Case 1: PGRC Complaint for Mepco
    c1 = ComplaintCase(
        source_ref="PGRC/2026/014",
        track_type_id=tr_comp.track_type_id,
        category_id=cat_fees.category_id,
        received_on=datetime.date(2026, 7, 1),
        priority="MEDIUM",
        complainant_type="STUDENT"
    )
    # Case 2: RB Show-Cause for Mepco
    c2 = ComplaintCase(
        source_ref="RB/SC/2026/089",
        track_type_id=tr_sc.track_type_id,
        category_id=cat_fac.category_id,
        received_on=datetime.date(2026, 7, 10),
        priority="HIGH",
        complainant_type="WHISTLEBLOWER"
    )
    # Case 3: PGRC complaint for PSG Tech
    c3 = ComplaintCase(
        source_ref="PGRC/2026/045",
        track_type_id=tr_comp.track_type_id,
        category_id=cat_infra.category_id,
        received_on=datetime.date(2026, 8, 12),
        priority="LOW",
        complainant_type="STUDENT"
    )
    # Case 4: RB Inspection for PSG Tech
    c4 = ComplaintCase(
        source_ref="RB/EVC/2026/012",
        track_type_id=tr_evc.track_type_id,
        category_id=cat_infra.category_id,
        received_on=datetime.date(2026, 8, 15),
        priority="MEDIUM",
        complainant_type="PARENT"
    )
    # Case 5: CEG Anna Univ
    c5 = ComplaintCase(
        source_ref="PGRC/2026/078",
        track_type_id=tr_cp.track_type_id,
        category_id=cat_other.category_id,
        received_on=datetime.date(2026, 6, 20),
        priority="LOW",
        complainant_type="CITIZEN"
    )
    # Case 6: HBTU Kanpur (SLA Breached)
    c6 = ComplaintCase(
        source_ref="RB/SC/2026/041",
        track_type_id=tr_sc.track_type_id,
        category_id=cat_adm.category_id,
        received_on=datetime.date(2026, 5, 10),
        priority="HIGH",
        complainant_type="STUDENT"
    )

    db.add_all([c1, c2, c3, c4, c5, c6])
    db.flush()

    # Case Texts
    db.add_all([
        CaseText(case_id=c1.case_id, complainant_name="Karthik S.", summary="Non-refund of caution deposit and arbitrary retention fee charged after course completion.", full_text="Student completed B.Tech in 2025. College refuses to release Rs. 25,000 caution deposit citing unverified lab dues."),
        CaseText(case_id=c2.case_id, complainant_name="Confidential Faculty Group", summary="Show-Cause: Retrenchment of 12 senior faculty without notice; cadre ratio violated under APH Chapter VII.", full_text="AICTE inspection team notes 1:40 student-faculty ratio in CSE and unpaid salaries for past 4 months."),
        CaseText(case_id=c3.case_id, complainant_name="R. Preethi", summary="Excess unapproved laboratory development fee of Rs. 15,000 demanded for cloud computing lab.", full_text="Students compelled to pay development fees without official receipt."),
        CaseText(case_id=c4.case_id, complainant_name="Inspection Officer", summary="EVC Scrutiny on computer lab server infrastructure compliance and AICTE norms.", full_text="Routine physical verification of server labs and subscribed IEEE technical journals."),
        CaseText(case_id=c5.case_id, complainant_name="Alumni Reference", summary="Hostel drinking water filtration maintenance complaint and dining hall hygiene.", full_text="PGRC petition regarding delayed water cooler repairs."),
        CaseText(case_id=c6.case_id, complainant_name="State Quota Aspirants", summary="Irregularity in lateral entry seat matrix allocation and non-adherence to reservation roster.", full_text="Discrepancy noted in category-wise merit allotment. Matter pending hearing beyond prescribed timeline.")
    ])
    db.flush()

    # Entity Links
    db.add_all([
        CaseInstitutionLink(case_id=c1.case_id, inst_id=inst_mepco.inst_id, method="GEO_FUZZY", tier="HIGH", confidence_score=0.96),
        CaseInstitutionLink(case_id=c2.case_id, inst_id=inst_mepco.inst_id, method="EXACT_PERMANENT_ID", tier="HIGH", confidence_score=1.0),
        CaseInstitutionLink(case_id=c3.case_id, inst_id=inst_psg.inst_id, method="RAPIDFUZZ", tier="HIGH", confidence_score=0.92),
        CaseInstitutionLink(case_id=c4.case_id, inst_id=inst_psg.inst_id, method="EXACT_PERMANENT_ID", tier="HIGH", confidence_score=1.0),
        CaseInstitutionLink(case_id=c5.case_id, inst_id=inst_ceg.inst_id, method="EXACT_PERMANENT_ID", tier="HIGH", confidence_score=1.0),
        CaseInstitutionLink(case_id=c6.case_id, inst_id=inst_hbtu.inst_id, method="EXACT_PERMANENT_ID", tier="HIGH", confidence_score=1.0),
    ])
    db.flush()

    # Events (Bitemporal Timeline)
    # Case 1 events: Received 1 Jul, Processed 5 Jul, DISPOSED 20 Jul (Clean-chit issued)
    db.add(CaseEvent(case_id=c1.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 7, 1, 10, 0), recorded_at=datetime.datetime(2026, 7, 1, 10, 5), to_status_id=st_pend.status_id, to_bureau_id=pgrc.bureau_id, remarks="Petition registered via online portal."))
    db.add(CaseEvent(case_id=c1.case_id, event_type="STATUS_CHANGE", event_time=datetime.datetime(2026, 7, 5, 11, 0), recorded_at=datetime.datetime(2026, 7, 5, 11, 2), to_status_id=st_proc.status_id, to_officer_id=off_pgrc.officer_id, remarks="Notice sent to college management."))
    db.add(CaseEvent(case_id=c1.case_id, event_type="DISPOSAL", event_time=datetime.datetime(2026, 7, 20, 15, 30), recorded_at=datetime.datetime(2026, 7, 20, 15, 35), to_status_id=st_disp.status_id, remarks="College submitted refund acknowledgement. Complaint closed with clean chit."))

    # Case 2 events: Happened 10 Jul, Recorded 15 Jul (Late import), Still UNDER_PROCESS
    db.add(CaseEvent(case_id=c2.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 7, 10, 9, 30), recorded_at=datetime.datetime(2026, 7, 15, 14, 0), to_status_id=st_proc.status_id, to_bureau_id=rb.bureau_id, to_officer_id=off_rb.officer_id, remarks="Statutory Show-Cause notice issued under APH Chapter VII."))
    db.add(CaseEvent(case_id=c2.case_id, event_type="STATUS_CHANGE", event_time=datetime.datetime(2026, 7, 22, 10, 0), recorded_at=datetime.datetime(2026, 7, 22, 10, 5), to_status_id=st_proc.status_id, remarks="Standing Hearing Committee (SHC) convened. Defense document scrutinised."))

    # Case 3 events: Under process
    db.add(CaseEvent(case_id=c3.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 8, 12, 10, 0), recorded_at=datetime.datetime(2026, 8, 12, 10, 0), to_status_id=st_pend.status_id, to_bureau_id=pgrc.bureau_id, remarks="Student complaint received."))

    # Case 4 events: Under process
    db.add(CaseEvent(case_id=c4.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 8, 15, 10, 0), recorded_at=datetime.datetime(2026, 8, 15, 10, 0), to_status_id=st_proc.status_id, to_bureau_id=rb.bureau_id, to_officer_id=off_sro.officer_id, remarks="Inspection underway."))

    # Case 5 events: Disposed
    db.add(CaseEvent(case_id=c5.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 6, 20, 10, 0), recorded_at=datetime.datetime(2026, 6, 20, 10, 0), to_status_id=st_pend.status_id, to_bureau_id=pgrc.bureau_id, remarks="Received."))
    db.add(CaseEvent(case_id=c5.case_id, event_type="DISPOSAL", event_time=datetime.datetime(2026, 7, 5, 10, 0), recorded_at=datetime.datetime(2026, 7, 5, 10, 0), to_status_id=st_disp.status_id, remarks="Resolved by university warden."))

    # Case 6 events: Escalated (SLA Breached)
    db.add(CaseEvent(case_id=c6.case_id, event_type="RECEIVED", event_time=datetime.datetime(2026, 5, 10, 10, 0), recorded_at=datetime.datetime(2026, 5, 10, 10, 0), to_status_id=st_proc.status_id, to_bureau_id=rb.bureau_id, remarks="Show cause issued."))
    db.add(CaseEvent(case_id=c6.case_id, event_type="ESCALATION", event_time=datetime.datetime(2026, 7, 1, 10, 0), recorded_at=datetime.datetime(2026, 7, 1, 10, 0), to_status_id=st_esc.status_id, remarks="Exceeded 45-day statutory limit without disposal order. Escalated to Member Secretary."))

    db.flush()

    # Relationships & Overlaps
    db.add(Relationship(
        case_a_id=c1.case_id,
        case_b_id=c2.case_id,
        rel_type="RELATED_PARALLEL",
        tier="HIGH",
        status="CONFIRMED",
        rationale="Same institution (PID 1-1049281721), concurrent investigations across PGRC and RB."
    ))
    db.add(Relationship(
        case_a_id=c3.case_id,
        case_b_id=c4.case_id,
        rel_type="RELATED_PARALLEL",
        tier="MEDIUM",
        status="PROPOSED",
        rationale="Shared institution (PSG Tech) and overlapping infrastructure clause."
    ))
    db.flush()

    # Alerts
    db.add(Alert(
        alert_type="CONTRADICTION_DISSONANCE",
        case_id=c1.case_id,
        inst_id=inst_mepco.inst_id,
        responsible_bureau_id=rb.bureau_id,
        severity="CRITICAL",
        reason="PGRC marked case PGRC/2026/014 as DISPOSED, while Regulation Bureau maintains active proceeding RB/SC/2026/089. Joint Review Required."
    ))
    db.add(Alert(
        alert_type="OVERLAP",
        case_id=c3.case_id,
        inst_id=inst_psg.inst_id,
        responsible_bureau_id=pgrc.bureau_id,
        severity="WARNING",
        reason="Concurrent proceedings detected between PGRC and RB for PSG College of Technology."
    ))
    db.add(Alert(
        alert_type="SLA_OVERDUE",
        case_id=c6.case_id,
        inst_id=inst_hbtu.inst_id,
        responsible_bureau_id=rb.bureau_id,
        severity="CRITICAL",
        reason="Case RB/SC/2026/041 exceeded 45-day statutory timeline. Action overdue."
    ))

    db.commit()
    db.close()
    print("Database seeded successfully with rich realistic AICTE test scenarios!")

if __name__ == "__main__":
    init_database()
