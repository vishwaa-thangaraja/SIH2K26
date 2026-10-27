"""Optional FastAPI wrapper. Start with: uvicorn api:app --reload"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from src.classification import predict_category
from src.duplicate_detection import find_duplicates
from src.priority_prediction import predict_priority
from src.bureau_recommendation import recommend_bureau

app = FastAPI(title="CASELINK ML API", version="1.0.0")


class ComplaintRequest(BaseModel):
    complaint: str = Field(min_length=1, max_length=10000)


class DuplicateRequest(ComplaintRequest):
    threshold: float = Field(default=0.25, ge=0, le=1)
    max_results: int = Field(default=5, ge=1, le=50)


class BureauRequest(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    override: str | None = Field(default=None, max_length=200)


def safe_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400 if isinstance(exc, ValueError) else 503, detail=str(exc)) from exc


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/category")
def category(request: ComplaintRequest):
    return safe_call(predict_category, request.complaint)


@app.post("/detect/duplicates")
def duplicates(request: DuplicateRequest):
    return safe_call(find_duplicates, request.complaint, threshold=request.threshold, max_results=request.max_results)


@app.post("/predict/priority")
def priority(request: ComplaintRequest):
    return safe_call(predict_priority, request.complaint)


@app.post("/recommend/bureau")
def bureau(request: BureauRequest):
    return safe_call(recommend_bureau, request.category, override=request.override)
