"""TF-IDF cosine similarity baseline for possible duplicate complaints."""
from pathlib import Path
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .data_validation import clean_complaint, load_csv

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA = ROOT / "data" / "duplicate_samples.csv"


def find_duplicates(complaint, path=DEFAULT_DATA, threshold=0.25, max_results=5):
    complaint = clean_complaint(complaint)
    if not 0 <= threshold <= 1:
        raise ValueError("threshold must be between 0 and 1.")
    if max_results < 1:
        raise ValueError("max_results must be at least 1.")
    data = load_csv(path, ["complaint"])
    if data.empty:
        return {"matches": [], "message": "No existing complaints are available to compare."}
    texts = data["complaint"].tolist()
    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(texts + [complaint])
    scores = cosine_similarity(matrix[-1], matrix[:-1]).ravel()
    data = data.copy()
    data["similarity"] = scores
    data = data[data.similarity >= threshold].sort_values("similarity", ascending=False).head(max_results)
    matches = [{"complaint": row.complaint, "similarity": float(row.similarity)}
               for row in data.itertuples(index=False)]
    return {"matches": matches, "message": "Possible matches only; staff review is required." if matches else "No likely matches found."}
