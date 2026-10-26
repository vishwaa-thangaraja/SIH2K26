from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.schema_models import CaseText
from app.models.api_schemas import MLInferenceRequest, MLInferenceResponse
from app.ml.ml_service import ml_service

router = APIRouter(prefix="/ml", tags=["ML Text Intelligence"])

@router.post("/infer", response_model=MLInferenceResponse)
def infer_complaint_intelligence(payload: MLInferenceRequest, db: Session = Depends(get_db)):
    text = payload.complaint_text
    category, conf = ml_service.classify_complaint(text)
    priority = ml_service.predict_priority(text)
    bureau = ml_service.recommend_bureau(category, priority)

    # Fetch existing case texts for duplicate check
    existing_texts = [ct.summary for ct in db.query(CaseText).all() if ct.summary]
    dup_score, is_dup = ml_service.detect_duplicate_text(text, existing_texts)

    return MLInferenceResponse(
        predicted_category=category,
        category_confidence=conf,
        suggested_priority=priority,
        recommended_bureau=bureau,
        potential_duplicate_score=dup_score,
        is_probable_duplicate=is_dup
    )
