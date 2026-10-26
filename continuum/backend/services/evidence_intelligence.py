def extract_fields_from_document(doc_type: str, filename: str) -> dict:
    return {
        "employer": {"value": "ABC Manufacturing", "confidence": 0.9},
        "role": {"value": "CNC Operator", "confidence": 0.8},
        "date": {"value": "2023-10-01", "confidence": 0.95},
        "wage": {"value": 18000, "confidence": 0.85}
    }

def compare_claim_to_evidence(claim: dict, extracted: dict) -> dict:
    return {
        "overall_consistency_score": 0.93,
        "field_matches": {
            "employer": True,
            "wage": True
        }
    }

def classify_outcome_type(description: str) -> dict:
    return {
        "outcome_type": "employment",
        "confidence": 0.91
    }
