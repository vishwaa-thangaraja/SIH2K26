from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.entity_resolver import EntityResolverCascade
from app.models.api_schemas import EntityResolveRequest, EntityResolveResponse, EntityMatchCandidate

router = APIRouter(prefix="/entity", tags=["Entity Resolution"])

@router.post("/resolve", response_model=EntityResolveResponse)
def resolve_institution(payload: EntityResolveRequest, db: Session = Depends(get_db)):
    resolver = EntityResolverCascade(db)
    inst, score, method, tier = resolver.resolve(
        raw_name=payload.raw_name,
        state_id=payload.state_id,
        district_id=payload.district_id,
        pincode=payload.pincode
    )

    if not inst:
        return EntityResolveResponse(
            query=payload.raw_name,
            matched=False,
            best_match=None,
            all_candidates=[],
            requires_human_review=True
        )

    dist_name = inst.district.name if inst.district else None
    state_name = inst.district.state.name if inst.district and inst.district.state else None

    candidate = EntityMatchCandidate(
        inst_id=inst.inst_id,
        permanent_id=inst.permanent_id,
        name=inst.name,
        district=dist_name,
        state=state_name,
        confidence_score=score,
        method=method,
        tier=tier
    )

    return EntityResolveResponse(
        query=payload.raw_name,
        matched=True,
        best_match=candidate,
        all_candidates=[candidate],
        requires_human_review=(tier != "HIGH")
    )
