import os
import joblib
import pandas as pd
import recordlinkage
from recordlinkage.datasets import load_febrl1
from recordlinkage import Compare
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, classification_report

MODEL_DIR = "ml/entity_resolution/"
MODEL_PATH = os.path.join(MODEL_DIR, "identity_model.pkl")

def train_and_save_model():
    print("Loading structural FEBRL1 dataset...")
    df, links = load_febrl1(return_links=True)
    
    # Clean data data formats
    for col in df.columns:
        df[col] = df[col].fillna("").astype(str).str.lower().str.strip()
        
    print(f"Dataset Size: {len(df)} records. Constructing comparison pairs...")
    
    # Set index configuration using regional clustering
    indexer = recordlinkage.Index()
    indexer.block('suburb') 
    candidate_pairs = indexer.index(df)
    
    print(f"Calculated {len(candidate_pairs)} candidate combinations.")
    
    # Configure comparison features matching library rules
    compare = Compare()
    compare.string("given_name", "given_name", method="jarowinkler", label="first_name")
    compare.string("surname", "surname", method="jarowinkler", label="last_name")
    compare.string("address_1", "address_1", method="jarowinkler", label="address")
    
    # FIX: Using the correct compare.exact method instead of compare.string
    compare.exact("postcode", "postcode", label="zipcode")
    compare.exact("date_of_birth", "date_of_birth", label="dob")
    compare.exact("soc_sec_id", "soc_sec_id", label="national_id")
    
    features = compare.compute(candidate_pairs, df)
    
    # Map absolute Ground Truth indices
    true_links_set = {tuple(sorted(pair)) for pair in links}
    features["match"] = [1 if tuple(sorted(pair)) in true_links_set else 0 for pair in features.index]
    
    X = features.drop(columns=["match"])
    y = features["match"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    print("Fitting Balanced Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"\nTraining Complete. Model F1-Score Evaluation: {f1_score(y_test, preds):.4f}")
    print(classification_report(y_test, preds))
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model successfully saved out as an artifact to: {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save_model()
