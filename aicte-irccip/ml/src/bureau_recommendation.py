"""Editable demonstration category-to-cell routing rules."""
from pathlib import Path
from .data_validation import load_csv

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MAPPING = ROOT / "data" / "bureau_mapping.csv"


def recommend_bureau(category, path=DEFAULT_MAPPING, override=None):
    category = str(category).strip()
    if not category:
        raise ValueError("Category must be a non-empty string.")
    if override is not None and str(override).strip():
        return {"category": category, "bureau": str(override).strip(), "source": "user override"}
    data = load_csv(path, ["category", "bureau"])
    rows = data[data.category.str.casefold() == category.casefold()]
    if rows.empty:
        return {"category": category, "bureau": None, "message": "No demonstration mapping is configured."}
    return {"category": category, "bureau": str(rows.iloc[0].bureau), "source": "editable demonstration mapping; not an official AICTE assignment"}
