import os
import joblib
import pandas as pd
import recordlinkage
from recordlinkage.datasets import load_febrl1
from recordlinkage import Compare
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/api/identity",
    tags=["Identity Resolution"]
)

# Core persistent file system structural markers
MODEL_DIR = "ml/entity_resolution"
MODEL_PATH = os.path.join(MODEL_DIR, "identity_model.pkl")
DATABASE_FILE = "continuum_users.csv"
MATCH_THRESHOLD = 0.85

def ensure_model_is_trained():
    """Checks if the ML model exists. If missing, it builds, trains, and saves it instantly."""
    if os.path.exists(MODEL_PATH):
        print(f"📦 Verified: ML Model found artifact at {MODEL_PATH}")
        return

    print("⚠️ ML Model artifact missing. Initializing automatic self-training sequence...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Load foundational training data patterns from the package library
    df, links = load_febrl1(return_links=True)
    
    for col in df.columns:
        df[col] = df[col].fillna("").astype(str).str.lower().str.strip()
        
    indexer = recordlinkage.Index()
    indexer.block('suburb') 
    candidate_pairs = indexer.index(df)
    
    compare = Compare()
    compare.string("given_name", "given_name", method="jarowinkler", label="first_name")
    compare.string("surname", "surname", method="jarowinkler", label="last_name")
    compare.string("address_1", "address_1", method="jarowinkler", label="address")
    compare.exact("postcode", "postcode", label="zipcode")
    compare.exact("date_of_birth", "date_of_birth", label="dob")
    compare.exact("soc_sec_id", "soc_sec_id", label="national_id")
    
    features = compare.compute(candidate_pairs, df)
    
    true_links_set = {tuple(sorted(pair)) for pair in links}
    features["match"] = [1 if tuple(sorted(pair)) in true_links_set else 0 for pair in features.index]
    
    X = features.drop(columns=["match"])
    y = features["match"]
    
    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    print("Fitting Random Forest parameters against data clusters...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Self-training successful! Model exported directly to disk: {MODEL_PATH}")

ensure_model_is_trained()

class TraineeProfileSchema(BaseModel):
    given_name: str = Field(..., example="amit")
    surname: str = Field(..., example="sharma")
    address_1: str = Field(..., example="12 rolls road")
    suburb: str = Field(..., example="delhi")
    postcode: str = Field(..., example="110001")
    state: str = Field(..., example="delhi")
    date_of_birth: str = Field(..., example="1995-04-12")
    soc_sec_id: str = Field(..., example="12345678")

def get_comparison_engine():
    compare = Compare()
    compare.string("given_name", "given_name", method="jarowinkler", label="first_name")
    compare.string("surname", "surname", method="jarowinkler", label="last_name")
    compare.string("address_1", "address_1", method="jarowinkler", label="address")
    compare.exact("postcode", "postcode", label="zipcode")
    compare.exact("date_of_birth", "date_of_birth", label="dob")
    compare.exact("soc_sec_id", "soc_sec_id", label="national_id")
    return compare

@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_identity(profile: TraineeProfileSchema):
    """
    Evaluates an incoming identity profile object vector using the self-trained ML model.
    Flags high-confidence structural duplicates dynamically.
    """
    if os.path.exists(DATABASE_FILE):
        db = pd.read_csv(DATABASE_FILE, dtype=str).fillna("")
    else:
        db = pd.DataFrame(columns=["trainee_id", "given_name", "surname", "address_1", "suburb", "postcode", "state", "date_of_birth", "soc_sec_id"])
        db.to_csv(DATABASE_FILE, index=False)
        
    new_user = {k: str(v).strip().lower() for k, v in profile.dict().items()}
    
    if db.empty:
        return {
            "status": "new_identity_recommended",
            "message": "Database datastore ledger empty. Safe to insert fresh record.",
            "match_found": False,
            "best_match": None
        }

    match_lookup_df = db.copy()
    match_lookup_df.index = match_lookup_df["trainee_id"]
    
    new_record_df = pd.DataFrame([new_user], index=["NEW_RECORD"])
    fields = list(new_user.keys())
    combined_eval_df = pd.concat([match_lookup_df[fields], new_record_df])
    
    pair_index = pd.MultiIndex.from_tuples([("NEW_RECORD", tid) for tid in match_lookup_df["trainee_id"]])
    compare_engine = get_comparison_engine()
    computed_features = compare_engine.compute(pair_index, combined_eval_df)
    
    model = joblib.load(MODEL_PATH)
    probabilities = model.predict_proba(computed_features)[:, 1]
    
    results = pd.DataFrame({
        "trainee_id": match_lookup_df["trainee_id"].values,
        "similarity": probabilities
    }).sort_values(by="similarity", ascending=False)
    
    best_candidate = results.iloc[0]
    best_id = best_candidate["trainee_id"]
    best_score = float(best_candidate["similarity"])
    
    if best_score >= MATCH_THRESHOLD:
        matched_row = db[db["trainee_id"] == best_id].iloc[0].to_dict()
        return {
            "status": "conflict_detected",
            "message": f"Conflict Warning: Found potential profile collision match mapping to ID {best_id}",
            "match_found": True,
            "confidence_pct": round(best_score * 100, 2),
            "target_id": best_id,
            "existing_record": matched_row
        }
        
    return {
        "status": "new_identity_recommended",
        "message": "No closely aligned historical matches crossed confidence threshold constraints.",
        "match_found": False,
        "confidence_pct": round(best_score * 100, 2),
        "best_match": {"trainee_id": best_id, "score": round(best_score * 100, 2)}
    }

@router.post("/commit", status_code=status.HTTP_201_CREATED)
async def commit_identity(profile: TraineeProfileSchema, action: str, target_id: str = None):
    """
    Saves entries inside the primary structural CSV database block based on user instructions:
    - action='merge': Overwrites matching fields at a specific targeted trainee_id.
    - action='create': Registers profile as a new standalone record with a fresh ID code.
    """
    if os.path.exists(DATABASE_FILE):
        db = pd.read_csv(DATABASE_FILE, dtype=str).fillna("")
    else:
        db = pd.DataFrame(columns=["trainee_id", "given_name", "surname", "address_1", "suburb", "postcode", "state", "date_of_birth", "soc_sec_id"])

    new_user = {k: str(v).strip().lower() for k, v in profile.dict().items()}

    if action == "merge":
        if not target_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="target_id parameter parameter is mandatory for merge operations.")
        if not (db["trainee_id"] == target_id).any():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trainee tracking token index {target_id} not found.")
            
        row_mask = db["trainee_id"] == target_id
        for field in new_user.keys():
            db.loc[row_mask, field] = new_user[field]
        db.to_csv(DATABASE_FILE, index=False)
        return {"status": "success", "message": f"Merged records successfully. Identity token updated: {target_id}"}
        
    elif action == "create":
        if not db.empty and "trainee_id" in db.columns:
            valid_ids = [int(tid[1:]) for tid in db["trainee_id"].values if str(tid).startswith("T") and str(tid)[1:].isdigit()]
            max_num = max(valid_ids) if valid_ids else 0
        else:
            max_num = 0
            
        new_id = f"T{max_num + 1:03d}"
        new_row = {"trainee_id": new_id, **new_user}
        db = pd.concat([db, pd.DataFrame([new_row])], ignore_index=True)
        db.to_csv(DATABASE_FILE, index=False)
        return {"status": "success", "message": "Registered completely fresh profile payload entry.", "trainee_id": new_id}
        
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid action value string choice. Specify either 'merge' or 'create'.")
