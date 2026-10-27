"""TF-IDF and logistic regression complaint category classifier."""
from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from .data_validation import clean_complaint, load_csv

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "complaints.csv"
MODEL_PATH = ROOT / "models" / "complaint_classifier.joblib"


def load_training_data(path=DATA_PATH):
    data = load_csv(path, ["complaint", "category"])
    if data.empty:
        raise ValueError("No valid complaint/category rows found.")
    return data


def build_model():
    return Pipeline([("tfidf", TfidfVectorizer()),
                     ("classifier", LogisticRegression(max_iter=1000, random_state=42))])


def train_classifier(path=DATA_PATH, model_path=MODEL_PATH):
    data = load_training_data(path)
    if data["category"].nunique() < 2:
        raise ValueError("At least two categories are required to train the classifier.")
    model = build_model().fit(data["complaint"].tolist(), data["category"].tolist())
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    return model, data


def load_model(model_path=MODEL_PATH):
    if not Path(model_path).is_file():
        raise FileNotFoundError(f"Classifier model not found: {model_path}. Run train_classifier.py first.")
    return joblib.load(model_path)


def predict_category(complaint, model=None):
    complaint = clean_complaint(complaint)
    model = model or load_model()
    category = model.predict([complaint])[0]
    result = {"category": str(category)}
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba([complaint])[0]
        result["confidence_estimate"] = float(max(probabilities))
        result["confidence_note"] = "Uncalibrated model score; not a guaranteed probability."
    return result
