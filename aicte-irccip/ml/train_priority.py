"""Train the optional priority model using labeled demo or approved data."""
from src.priority_prediction import train_priority
from pathlib import Path


def main():
    model, report = train_priority(report_path=Path("reports/priority_evaluation.json"))
    print(report.get("message", report["evaluation_note"]))
    if model is not None:
        print(f"Saved priority model to models/complaint_priority.joblib; holdout accuracy {report['accuracy']:.3f}.")
    else:
        print("No model saved.")


if __name__ == "__main__":
    main()
