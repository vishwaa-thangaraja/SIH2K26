import pandas as pd
from src.duplicate_detection import find_duplicates


def test_similar_and_unrelated(tmp_path):
    path = tmp_path / "items.csv"
    pd.DataFrame({"complaint": ["Exam hall ticket download is failing", "Library books are missing"]}).to_csv(path, index=False)
    result = find_duplicates("Unable to download exam hall ticket", path, threshold=.1)
    assert result["matches"]
    assert "hall ticket" in result["matches"][0]["complaint"]


def test_no_matches(tmp_path):
    path = tmp_path / "items.csv"
    pd.DataFrame({"complaint": ["Library books are missing"]}).to_csv(path, index=False)
    result = find_duplicates("Examination hall ticket download fails", path, threshold=.7)
    assert result["matches"] == []
    assert result["message"] == "No likely matches found."
