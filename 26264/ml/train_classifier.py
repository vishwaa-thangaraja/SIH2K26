"""Train and evaluate CASELINK's complaint category classifier."""
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from src.classification import load_training_data, build_model, train_classifier

ROOT = Path(__file__).resolve().parent
REPORT = ROOT / "reports" / "classification_evaluation.json"


def main():
    data = load_training_data()
    labels = sorted(data.category.unique())
    report = {"sample_count": len(data), "categories": labels,
              "limitations": "36 synthetic records; metrics are unstable and do not establish real-world performance."}
    counts = data.category.value_counts()
    if len(data) >= 12 and len(labels) > 1 and counts.min() >= 2:
        X_train, X_test, y_train, y_test = train_test_split(
            data.complaint, data.category, test_size=max(len(labels), round(len(data) * .25)) / len(data),
            random_state=42, stratify=data.category)
        evaluation_model = build_model().fit(X_train, y_train)
        predicted = evaluation_model.predict(X_test)
        report.update({"evaluation": "stratified holdout", "test_samples": len(y_test),
                       "accuracy": float(accuracy_score(y_test, predicted)),
                       "classification_report": classification_report(y_test, predicted, output_dict=True, zero_division=0),
                       "confusion_matrix": confusion_matrix(y_test, predicted, labels=labels).tolist(),
                       "confusion_matrix_labels": labels})
    else:
        report["evaluation"] = "not feasible: too few examples per class for a meaningful holdout"
    model, data = train_classifier()
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Saved full-data classifier to models/complaint_classifier.joblib ({len(data)} rows).")
    print(f"Evaluation report: {REPORT.relative_to(ROOT)}")
    print(f"Evaluation: {report['evaluation']}")
    if "accuracy" in report:
        print(f"Holdout accuracy: {report['accuracy']:.3f} (not training accuracy)")


if __name__ == "__main__":
    main()
