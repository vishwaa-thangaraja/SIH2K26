"""Shared loading and validation for CASELINK CSV inputs."""
from pathlib import Path
import pandas as pd


def load_csv(path, required_columns):
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"Dataset not found: {path}")
    frame = pd.read_csv(path)
    missing = sorted(set(required_columns) - set(frame.columns))
    if missing:
        raise ValueError(f"{path} is missing required columns: {', '.join(missing)}")
    for column in required_columns:
        frame[column] = frame[column].astype("string").str.strip()
        frame[column] = frame[column].replace("", pd.NA)
    return frame.dropna(subset=required_columns).reset_index(drop=True)


def clean_complaint(value):
    if not isinstance(value, str) or not value.strip():
        raise ValueError("Complaint text must be a non-empty string.")
    return " ".join(value.split())
