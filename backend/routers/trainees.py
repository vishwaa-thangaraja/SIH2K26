from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.trainee import Trainee, TraineeRead, TraineeUpdate, DSIGNode, DSIGEdge, DSIGGraphResponse, IdentityAnchor

from typing import List, Optional
from models.training_intake import TrainingRecord, AssessmentRecord, CertificationRecord, TraineeSkill

router = APIRouter()

@router.get("")
def get_all_trainees(limit: int = 500, db: Session = Depends(get_db)):
    """
    Returns all trainees persisted in the CONTINUUM database with their training metadata.
    """
    trainees = db.exec(select(Trainee).limit(limit)).all()
    results = []
    
    # Pre-fetch training records
    trn_map = {}
    trns = db.exec(select(TrainingRecord)).all()
    for trn in trns:
        trn_map[trn.trainee_id] = trn

    for t in trainees:
        trn = trn_map.get(t.trainee_id)
        results.append({
            "id": t.id,
            "trainee_id": t.trainee_id,
            "name": t.name,
            "email": t.email,
            "phone": t.phone,
            "program": trn.course if trn else t.program,
            "provider": trn.training_provider if trn else t.provider,
            "sector": trn.sector if trn and trn.sector else "Automotive & Precision Welding",
            "nsqf_level": 4 if not trn else (5 if "l5" in (trn.course or "").lower() else 4),
            "district": t.district or "Madurai",
            "state": t.state or "Tamil Nadu",
            "gender": t.gender or "Male",
            "enrollment_date": str(t.enrollment_date),
            "completion_date": str(t.completion_date) if t.completion_date else None,
            "status": t.status,
            "attendance_percentage": trn.attendance_percentage if trn else 85.0,
        })
    return results

@router.patch("/{trainee_id}")
@router.put("/{trainee_id}")
def update_trainee(trainee_id: str, payload: TraineeUpdate, db: Session = Depends(get_db)):
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")

    if payload.name is not None and payload.name.strip():
        trainee.name = payload.name.strip()
    if payload.email is not None and payload.email.strip():
        trainee.email = payload.email.strip()
    if payload.phone is not None and payload.phone.strip():
        trainee.phone = payload.phone.strip()
    if payload.program is not None and payload.program.strip():
        trainee.program = payload.program.strip()
    if payload.provider is not None and payload.provider.strip():
        trainee.provider = payload.provider.strip()
    if payload.district is not None and payload.district.strip():
        trainee.district = payload.district.strip()
    if payload.state is not None and payload.state.strip():
        trainee.state = payload.state.strip()
    if payload.status is not None and payload.status.strip():
        trainee.status = payload.status.strip()
    if payload.gender is not None and payload.gender.strip():
        trainee.gender = payload.gender.strip()
    if payload.completion_date is not None:
        trainee.completion_date = payload.completion_date

    # Synchronize DSIG nodes if phone or email was modified
    if payload.phone:
        phone_node = db.exec(select(DSIGNode).where(DSIGNode.trainee_id == trainee_id, DSIGNode.node_type == "phone")).first()
        if phone_node:
            phone_node.value = trainee.phone
            db.add(phone_node)

    if payload.email:
        email_node = db.exec(select(DSIGNode).where(DSIGNode.trainee_id == trainee_id, DSIGNode.node_type == "email")).first()
        if email_node:
            email_node.value = trainee.email
            db.add(email_node)

    db.add(trainee)
    db.commit()
    db.refresh(trainee)
    return {
        "status": "success",
        "message": f"Trainee {trainee_id} updated successfully by administrator.",
        "trainee": trainee
    }

@router.get("/{trainee_id}", response_model=TraineeRead)
def get_trainee(trainee_id: str, db: Session = Depends(get_db)):
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee

@router.get("/{trainee_id}/dsig", response_model=DSIGGraphResponse)
def get_trainee_dsig(trainee_id: str, db: Session = Depends(get_db)):
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")

    nodes = list(db.exec(select(DSIGNode).where(DSIGNode.trainee_id == trainee_id)).all())
    edges = list(db.exec(select(DSIGEdge).where(DSIGEdge.trainee_id == trainee_id)).all())

    # Synthesize complete anchor graph if nodes or edges are incomplete
    core_id = f"core-{trainee_id}"
    node_types = {n.node_type for n in nodes}

    if "identity" not in node_types:
        nodes.append(DSIGNode(
            node_id=core_id,
            trainee_id=trainee_id,
            node_type="identity",
            label="Trainee Core",
            value=trainee_id,
            is_active=True,
            valid_from=trainee.enrollment_date,
            confidence=1.0,
            verification_method="platform_registration"
        ))

    # Phone Node
    if "phone" not in node_types and trainee.phone:
        phone_node_id = f"phone-{trainee_id}"
        nodes.append(DSIGNode(
            node_id=phone_node_id,
            trainee_id=trainee_id,
            node_type="phone",
            label="Primary Phone",
            value=trainee.phone,
            is_active=True,
            valid_from=trainee.enrollment_date,
            confidence=0.98,
            verification_method="otp_verified"
        ))
        edges.append(DSIGEdge(
            edge_id=f"edge-p-{trainee_id}",
            trainee_id=trainee_id,
            source_node_id=core_id,
            target_node_id=phone_node_id,
            edge_type="identity_link",
            label="Registered Mobile",
            valid_from=trainee.enrollment_date,
            confidence=0.98
        ))

    # Email Node
    if "email" not in node_types and trainee.email:
        email_node_id = f"email-{trainee_id}"
        nodes.append(DSIGNode(
            node_id=email_node_id,
            trainee_id=trainee_id,
            node_type="email",
            label="Primary Email",
            value=trainee.email,
            is_active=True,
            valid_from=trainee.enrollment_date,
            confidence=0.95,
            verification_method="email_verified"
        ))
        edges.append(DSIGEdge(
            edge_id=f"edge-e-{trainee_id}",
            trainee_id=trainee_id,
            source_node_id=core_id,
            target_node_id=email_node_id,
            edge_type="identity_link",
            label="Institutional Contact",
        ))

        # Training Node
        trn = db.exec(select(TrainingRecord).where(TrainingRecord.trainee_id == trainee_id)).first()
        if trn:
            trn_node_id = f"trn-{trn.record_id}"
            nodes.append(DSIGNode(
                node_id=trn_node_id,
                trainee_id=trainee_id,
                node_type="training",
                label=f"Training: {trn.course}",
                value=f"{trn.training_provider} ({trn.batch_id})",
                is_active=True,
                valid_from=trn.training_start_date,
                confidence=1.0,
                verification_method="institute_intake"
            ))
            edges.append(DSIGEdge(
                edge_id=f"edge-trn-{trainee_id}",
                trainee_id=trainee_id,
                source_node_id=core_id,
                target_node_id=trn_node_id,
                edge_type="certification",
                label=f"{trn.training_status} (Att: {trn.attendance_percentage}%)",
                valid_from=trn.training_start_date,
                confidence=1.0
            ))

        # Certification / Assessment Node
        cert = db.exec(select(CertificationRecord).where(CertificationRecord.trainee_id == trainee_id)).first()
        if cert:
            cert_node_id = f"cert-{cert.certification_id}"
            nodes.append(DSIGNode(
                node_id=cert_node_id,
                trainee_id=trainee_id,
                node_type="training",
                label=f"Cert: {cert.certification_status}",
                value=f"{cert.course} ({cert.certification_id})",
                is_active=True,
                valid_from=cert.certification_date or trainee.enrollment_date,
                confidence=1.0,
                verification_method="digilocker_verified"
            ))
            edges.append(DSIGEdge(
                edge_id=f"edge-cert-{trainee_id}",
                trainee_id=trainee_id,
                source_node_id=core_id,
                target_node_id=cert_node_id,
                edge_type="credential",
                label="NCVET / Sector Skill Council",
                valid_from=cert.certification_date or trainee.enrollment_date,
                confidence=1.0
            ))

        # Skills Node
        skills = db.exec(select(TraineeSkill).where(TraineeSkill.trainee_id == trainee_id)).all()
        if skills:
            skill_names = ", ".join([s.skill_name for s in skills[:4]])
            skills_node_id = f"skills-{trainee_id}"
            nodes.append(DSIGNode(
                node_id=skills_node_id,
                trainee_id=trainee_id,
                node_type="training",
                label="Acquired Skills",
                value=skill_names,
                is_active=True,
                valid_from=trainee.enrollment_date,
                confidence=0.95,
                verification_method="competency_assessment"
            ))
            edges.append(DSIGEdge(
                edge_id=f"edge-skills-{trainee_id}",
                trainee_id=trainee_id,
                source_node_id=core_id,
                target_node_id=skills_node_id,
                edge_type="competency",
                label=f"{len(skills)} Skills Mapped",
                valid_from=trainee.enrollment_date,
                confidence=0.95
            ))

    return DSIGGraphResponse(nodes=nodes, edges=edges)

@router.get("/{trainee_id}/timeline")
def get_trainee_timeline(trainee_id: str, db: Session = Depends(get_db)):
    from models.outcome import OutcomeEvent
    events = db.exec(select(OutcomeEvent).where(OutcomeEvent.trainee_id == trainee_id)).all()
    # Simple sort mock
    return sorted(events, key=lambda x: x.start_date)

@router.get("/{trainee_id}/anchors")
def get_trainee_anchors(trainee_id: str, db: Session = Depends(get_db)):
    anchors = db.exec(select(IdentityAnchor).where(IdentityAnchor.trainee_id == trainee_id)).all()
    return anchors
