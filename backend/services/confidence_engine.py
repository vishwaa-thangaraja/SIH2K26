def compute_confidence_score(
    attestation_score: float = 1.0,
    ocr_consistency: float = 0.93,
    historical_alignment: float = 0.90,
    self_report_score: float = 1.0,
    anomaly_flags: list = None
) -> dict:
    """
    CONTINUUM Prototype Heuristic Confidence Engine:
    Confidence = 0.35 * Attestation + 0.30 * OCR Consistency + 0.21 * Historical Alignment + 0.14 * Self-Report
    Thresholds:
      >= 0.80 -> Verified (High Confidence)
      0.60 - 0.79 -> Review Required (Medium Confidence)
      < 0.60 -> Unverified / Disputed (Low Confidence)
    """
    if anomaly_flags is None:
        anomaly_flags = []

    # Calculate weighted score
    raw_score = (
        (0.35 * attestation_score) +
        (0.30 * ocr_consistency) +
        (0.21 * historical_alignment) +
        (0.14 * self_report_score)
    )

    # Anomaly adjustment
    if anomaly_flags:
        raw_score = max(0.0, raw_score - (0.25 * len(anomaly_flags)))

    final_score = round(min(1.0, max(0.0, raw_score)), 4)

    if final_score >= 0.80:
        label = "verified"
        recommendation = "Approved — High-confidence multi-source corroboration achieved."
    elif final_score >= 0.60:
        label = "review"
        recommendation = "Manual Review Required — Moderate corroboration, human verification suggested."
    else:
        label = "unverified"
        recommendation = "Unverified Claim — Insufficient corroborating evidence or anomaly detected."

    return {
        "confidence_score": final_score,
        "confidence_label": label,
        "weights": {
            "attestation": 0.35,
            "ocr_consistency": 0.30,
            "historical_alignment": 0.21,
            "self_report": 0.14
        },
        "factors": [
            f"Employer Attestation weight: {attestation_score:.2f} (35%)",
            f"OCR Entity Consistency: {ocr_consistency:.2f} (30%)",
            f"DSIG Historical Alignment: {historical_alignment:.2f} (21%)",
            f"Trainee Self-Report: {self_report_score:.2f} (14%)"
        ],
        "anomaly_flags": anomaly_flags,
        "recommendation": recommendation
    }

