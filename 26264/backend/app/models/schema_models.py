import datetime
from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, Boolean, Date, DateTime,
    ForeignKey, Float, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.database import Base

# --- Geography ---
class Region(Base):
    __tablename__ = "region"
    region_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    states = relationship("State", back_populates="region")

class State(Base):
    __tablename__ = "state"
    state_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    region_id = Column(Integer, ForeignKey("region.region_id"), nullable=False)
    region = relationship("Region", back_populates="states")
    districts = relationship("District", back_populates="state")

class District(Base):
    __tablename__ = "district"
    district_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    state_id = Column(Integer, ForeignKey("state.state_id"), nullable=False)
    state = relationship("State", back_populates="districts")
    institutions = relationship("Institution", back_populates="district")

# --- Organisation & Lookups ---
class BureauCell(Base):
    __tablename__ = "bureau_cell"
    bureau_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(20), unique=True, nullable=False)  # RB, PGRC, APPROVAL, VIGILANCE
    name = Column(String(150), nullable=False)
    kind = Column(String(50), default="BUREAU")
    officers = relationship("Officer", back_populates="bureau")

class Officer(Base):
    __tablename__ = "officer"
    officer_id = Column(Integer, primary_key=True, autoincrement=True)
    bureau_id = Column(Integer, ForeignKey("bureau_cell.bureau_id"), nullable=False)
    name = Column(String(150), nullable=False)
    designation = Column(String(100))
    email = Column(String(150))
    bureau = relationship("BureauCell", back_populates="officers")

class CanonicalStatus(Base):
    __tablename__ = "canonical_status"
    status_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)  # PENDING, UNDER_PROCESS, DISPOSED, TRANSFERRED, ESCALATED
    name = Column(String(100), nullable=False)

class TrackType(Base):
    __tablename__ = "track_type"
    track_type_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(150), nullable=False)

class ComplaintCategory(Base):
    __tablename__ = "complaint_category"
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)  # ADMISSION, FEES, FACULTY, INFRASTRUCTURE, HARASSMENT, OTHER
    name = Column(String(100), nullable=False)

# --- Institution Registry ---
class Institution(Base):
    __tablename__ = "institution"
    inst_id = Column(Integer, primary_key=True, autoincrement=True)
    permanent_id = Column(String(50), unique=True, nullable=False)  # AICTE PID
    name = Column(String(250), nullable=False)
    district_id = Column(Integer, ForeignKey("district.district_id"), nullable=True)
    address = Column(Text, nullable=True)
    pincode = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    district = relationship("District", back_populates="institutions")
    units = relationship("InstitutionUnit", back_populates="institution")
    variants = relationship("InstitutionNameVariant", back_populates="institution")
    case_links = relationship("CaseInstitutionLink", back_populates="institution")

class InstitutionUnit(Base):
    __tablename__ = "institution_unit"
    unit_id = Column(Integer, primary_key=True, autoincrement=True)
    inst_id = Column(BigInteger, ForeignKey("institution.inst_id"), nullable=False)
    unit_name = Column(String(200), nullable=False)
    institution = relationship("Institution", back_populates="units")

class InstitutionNameVariant(Base):
    __tablename__ = "institution_name_variant"
    variant_id = Column(Integer, primary_key=True, autoincrement=True)
    inst_id = Column(BigInteger, ForeignKey("institution.inst_id"), nullable=False)
    alias = Column(String(250), nullable=False)
    institution = relationship("Institution", back_populates="variants")

# --- Case & Event Log (Bitemporal Event Sourcing) ---
class ComplaintCase(Base):
    __tablename__ = "complaint_case"
    case_id = Column(Integer, primary_key=True, autoincrement=True)
    source_ref = Column(String(100), unique=True, nullable=False)  # e.g., PGRC/2026/014, RB/SC/2026/089
    track_type_id = Column(Integer, ForeignKey("track_type.track_type_id"), nullable=True)
    category_id = Column(Integer, ForeignKey("complaint_category.category_id"), nullable=True)
    received_on = Column(Date, nullable=False)
    priority = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH (can be predicted by ML)
    complainant_type = Column(String(50), default="STUDENT") # STUDENT, FACULTY, PARENT, WHISTLEBLOWER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    track_type = relationship("TrackType")
    category = relationship("ComplaintCategory")
    text_detail = relationship("CaseText", uselist=False, back_populates="case")
    institution_link = relationship("CaseInstitutionLink", uselist=False, back_populates="case")
    events = relationship("CaseEvent", back_populates="case", order_by="desc(CaseEvent.recorded_at)")

class CaseText(Base):
    __tablename__ = "case_text"
    case_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), primary_key=True)
    complainant_name = Column(String(150), nullable=True)
    summary = Column(Text, nullable=False)
    full_text = Column(Text, nullable=True)
    case = relationship("ComplaintCase", back_populates="text_detail")

class CaseInstitutionLink(Base):
    __tablename__ = "case_institution_link"
    link_id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), nullable=False)
    inst_id = Column(BigInteger, ForeignKey("institution.inst_id"), nullable=False)
    method = Column(String(50), default="EXACT_PERMANENT_ID")  # EXACT_PERMANENT_ID, GEO_FUZZY, RAPIDFUZZ, MANUAL
    tier = Column(String(20), default="HIGH")  # HIGH, MEDIUM, LOW
    review_state = Column(String(50), default="AUTO_ACCEPTED") # AUTO_ACCEPTED, PENDING_REVIEW, CONFIRMED
    confidence_score = Column(Float, default=1.0)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("ComplaintCase", back_populates="institution_link")
    institution = relationship("Institution", back_populates="case_links")

class CaseEvent(Base):
    __tablename__ = "case_event"
    event_id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), nullable=False)
    event_type = Column(String(50), nullable=False)  # RECEIVED, STATUS_CHANGE, BUREAU_TRANSFER, OFFICER_ASSIGN, DISPOSAL
    event_time = Column(DateTime, nullable=False)    # When real-world event happened (WORLD)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow) # When DB received it (RECORDED)
    to_status_id = Column(Integer, ForeignKey("canonical_status.status_id"), nullable=True)
    to_bureau_id = Column(Integer, ForeignKey("bureau_cell.bureau_id"), nullable=True)
    to_officer_id = Column(BigInteger, ForeignKey("officer.officer_id"), nullable=True)
    remarks = Column(Text, nullable=True)

    case = relationship("ComplaintCase", back_populates="events")
    status = relationship("CanonicalStatus")
    bureau = relationship("BureauCell")
    officer = relationship("Officer")

# --- Cross-Bureau Relationships & Alerts ---
class Relationship(Base):
    __tablename__ = "relationship"
    rel_id = Column(Integer, primary_key=True, autoincrement=True)
    case_a_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), nullable=False)
    case_b_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), nullable=False)
    rel_type = Column(String(50), default="RELATED_PARALLEL") # POTENTIAL_DUPLICATE, RELATED_PARALLEL, OUTCOME_DIFFERS
    tier = Column(String(20), default="MEDIUM")
    status = Column(String(50), default="PROPOSED") # PROPOSED, CONFIRMED, DISMISSED
    rationale = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    case_a = relationship("ComplaintCase", foreign_keys=[case_a_id])
    case_b = relationship("ComplaintCase", foreign_keys=[case_b_id])

class Alert(Base):
    __tablename__ = "alert"
    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(50), nullable=False)  # OVERLAP, CONTRADICTION_DISSONANCE, SLA_OVERDUE, JOINT_REVIEW_REQUESTED
    case_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), nullable=True)
    inst_id = Column(BigInteger, ForeignKey("institution.inst_id"), nullable=True)
    responsible_bureau_id = Column(Integer, ForeignKey("bureau_cell.bureau_id"), nullable=True)
    severity = Column(String(20), default="WARNING")  # INFO, WARNING, CRITICAL
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")     # ACTIVE, ACKNOWLEDGED, RESOLVED
    raised_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("ComplaintCase")
    institution = relationship("Institution")
    bureau = relationship("BureauCell")

# --- Joint Review Protocol ---
class JointReviewSession(Base):
    __tablename__ = "joint_review_session"
    session_id = Column(Integer, primary_key=True, autoincrement=True)
    inst_id = Column(BigInteger, ForeignKey("institution.inst_id"), nullable=False)
    initiator_bureau_id = Column(Integer, ForeignKey("bureau_cell.bureau_id"), nullable=False)
    target_bureau_id = Column(Integer, ForeignKey("bureau_cell.bureau_id"), nullable=False)
    status = Column(String(50), default="REQUESTED")  # REQUESTED, IN_CONFERENCE, RESOLVED, DISMISSED
    coordination_reason = Column(Text, nullable=False)
    outcome_memo = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    institution = relationship("Institution")
    initiator_bureau = relationship("BureauCell", foreign_keys=[initiator_bureau_id])
    target_bureau = relationship("BureauCell", foreign_keys=[target_bureau_id])
    cases = relationship("JointReviewCase", back_populates="session")

class JointReviewCase(Base):
    __tablename__ = "joint_review_case"
    session_id = Column(BigInteger, ForeignKey("joint_review_session.session_id"), primary_key=True)
    case_id = Column(BigInteger, ForeignKey("complaint_case.case_id"), primary_key=True)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("JointReviewSession", back_populates="cases")
    case = relationship("ComplaintCase")
