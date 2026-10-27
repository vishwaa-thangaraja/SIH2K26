from src.priority_prediction import load_priority_data, predict_priority, train_priority


def test_priority_training_and_prediction(tmp_path):
    model, report = train_priority(model_path=tmp_path / "priority.joblib")
    assert model is not None and report["trained"]
    assert predict_priority("Unsafe damaged electrical wiring", model)["priority"] in {"Low", "Medium", "High"}


def test_unavailable_training_data(tmp_path):
    # Missing files are reported clearly by the shared CSV loader.
    import pytest
    with pytest.raises(FileNotFoundError):
        load_priority_data(tmp_path / "missing.csv")


def test_rule_fallback_without_saved_model(monkeypatch, tmp_path):
    import src.priority_prediction as module
    monkeypatch.setattr(module, "MODEL_PATH", tmp_path / "absent.joblib")
    assert predict_priority("Unsafe classroom electrical wiring")["method"].startswith("rule-based")
