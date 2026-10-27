import pytest
from src.classification import build_model, load_training_data, predict_category, load_model


def test_valid_classification():
    data = load_training_data()
    model = build_model().fit(data.complaint, data.category)
    assert predict_category("My exam result marks are missing", model)["category"] in set(data.category)


@pytest.mark.parametrize("text", ["", "   ", None])
def test_invalid_complaint(text):
    with pytest.raises(ValueError):
        predict_category(text, object())


def test_missing_model(tmp_path):
    with pytest.raises(FileNotFoundError):
        load_model(tmp_path / "missing.joblib")


def test_missing_dataset_columns(tmp_path):
    path = tmp_path / "bad.csv"
    path.write_text("complaint\nHello\n", encoding="utf-8")
    with pytest.raises(ValueError, match="category"):
        load_training_data(path)
