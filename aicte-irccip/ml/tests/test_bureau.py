from src.bureau_recommendation import recommend_bureau


def test_known_and_unknown_categories():
    assert recommend_bureau("Fees")["bureau"].startswith("Demonstration")
    assert recommend_bureau("Unmapped")["bureau"] is None


def test_user_override():
    result = recommend_bureau("Fees", override="Chosen department")
    assert result["bureau"] == "Chosen department"
    assert result["source"] == "user override"
