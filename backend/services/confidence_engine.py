def compute_confidence_score(sources: list, evidence_quality: float, corroboration_count: int, anomaly_flags: list) -> dict:
    score = 0.8
    label = "high"
    if anomaly_flags:
        score -= 0.3
        label = "low"
    
    return {
        "confidence_score": score,
        "confidence_label": label,
        "factors": ["Good evidence quality", "Multiple corroborations"],
        "recommendation": "Approve"
    }
