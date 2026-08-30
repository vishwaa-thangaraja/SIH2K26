from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_db
from models.trainee import Trainee, TraineeRead, DSIGNode, DSIGEdge, DSIGGraphResponse, IdentityAnchor

router = APIRouter()

@router.get("/{trainee_id}", response_model=TraineeRead)
def get_trainee(trainee_id: str, db: Session = Depends(get_db)):
    trainee = db.exec(select(Trainee).where(Trainee.trainee_id == trainee_id)).first()
    if not trainee:
        raise HTTPException(status_code=404, detail="Trainee not found")
    return trainee

@router.get("/{trainee_id}/dsig", response_model=DSIGGraphResponse)
def get_trainee_dsig(trainee_id: str, db: Session = Depends(get_db)):
    nodes = db.exec(select(DSIGNode).where(DSIGNode.trainee_id == trainee_id)).all()
    edges = db.exec(select(DSIGEdge).where(DSIGEdge.trainee_id == trainee_id)).all()
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
