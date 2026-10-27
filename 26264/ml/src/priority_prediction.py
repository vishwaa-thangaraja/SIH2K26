"""Priority suggestion using a clearly labeled synthetic demo dataset."""
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from .data_validation import clean_complaint, load_csv

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "priority_samples.csv"
MODEL_PATH = ROOT / "models" / "complaint_priority.joblib"


def load_priority_data(path=DATA_PATH):
    return load_csv(path, ["complaint", "priority"])


def train_priority(path=DATA_PATH, model_path=MODEL_PATH, report_path=None):
    data = load_priority_data(path)
    if len(data) < 12 or data.priority.nunique() < 2:
        return None, {"trained": False, "message": "Insufficient labeled priority data; use the rule-based demo suggestion."}
    model = Pipeline([("tfidf", TfidfVectorizer()),
                      ("classifier", LogisticRegression(max_iter=1000, random_state=42))])
    counts = data.priority.value_counts()
    stratify = data.priority if counts.min() >= 2 else None
    test_size = max(data.priority.nunique(), round(len(data) * .25)) / len(data)
    test_size = min(test_size, .4)
    X_train, X_test, y_train, y_test = train_test_split(data.complaint, data.priority,
                                                        test_size=test_size, random_state=42,
                                                        stratify=data.priority if stratify is not None and counts.min() >= 2 else None)
    model.fit(X_train, y_train)
    from sklearn.metrics import accuracy_score
    report = {"trained": True, "evaluation_note": "Synthetic demonstration data only; results do not establish real-world performance.",
              "accuracy": float(accuracy_score(y_test, model.predict(X_test))),
              "classification_report": classification_report(y_test, model.predict(X_test), output_dict=True, zero_division=0),
              "confusion_matrix": confusion_matrix(y_test, model.predict(X_test), labels=sorted(data.priority.unique())).tolist(),
              "labels": sorted(data.priority.unique())}
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    if report_path:
        import json
        Path(report_path).parent.mkdir(parents=True, exist_ok=True)
        Path(report_path).write_text(json.dumps(report, indent=2), encoding="utf-8")
    return model, report


def predict_priority(complaint, model=None):
    complaint = clean_complaint(complaint)
    if model is None:
        if not MODEL_PATH.is_file():
            words = complaint.lower()
            priority = "High" if any(w in words for w in ("danger", "unsafe", "harassment", "injury", "urgent")) else "Medium"
            return {"priority": priority, "method": "rule-based demonstration suggestion; staff review required"}
        model = joblib.load(MODEL_PATH)
    predicted = str(model.predict([complaint])[0])
    result = {"priority": predicted, "method": "synthetic-data ML suggestion; staff review required"}
    if hasattr(model, "predict_proba"):
        result["confidence_estimate"] = float(max(model.predict_proba([complaint])[0]))
        result["confidence_note"] = "Uncalibrated model score; not a guaranteed probability."
    return result
