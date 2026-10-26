import re
import jellyfish
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.schema_models import Institution, InstitutionNameVariant, District

ABBREVIATIONS = {
    "engg": "engineering",
    "inst": "institute",
    "coll": "college",
    "tech": "technology",
    "univ": "university",
    "poly": "polytechnic",
    "mgmt": "management",
    "sci": "science",
    "adv": "advanced",
    "res": "research",
    "dept": "department"
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    cleaned = text.lower()
    cleaned = re.sub(r"[^a-z0-9\s]", " ", cleaned)
    tokens = cleaned.split()
    expanded_tokens = [ABBREVIATIONS.get(t, t) for t in tokens if t not in ["of", "the", "for", "and", "in", "at"]]
    return " ".join(expanded_tokens)

class EntityResolverCascade:
    def __init__(self, db: Session):
        self.db = db

    def resolve(
        self,
        raw_name: str,
        state_id: Optional[int] = None,
        district_id: Optional[int] = None,
        pincode: Optional[str] = None
    ) -> Tuple[Optional[Institution], float, str, str]:
        """
        Executes the 4-Tier Entity Resolution Cascade:
        Returns: (matched_institution, confidence_score, method, tier)
        """
        cleaned_raw = raw_name.strip()
        
        # --- Tier 1: Exact AICTE Permanent ID Match (O(1)) ---
        pid_match = re.search(r"\b(1-\d{8,12}|SYN-\d{4}|\d{10,12})\b", cleaned_raw, re.IGNORECASE)
        if pid_match:
            candidate_pid = pid_match.group(1).upper()
            inst = self.db.query(Institution).filter(Institution.permanent_id == candidate_pid).first()
            if inst:
                return inst, 1.0, "EXACT_PERMANENT_ID", "HIGH"

        # Check if entire query is exact PID
        exact_pid_inst = self.db.query(Institution).filter(Institution.permanent_id == cleaned_raw.upper()).first()
        if exact_pid_inst:
            return exact_pid_inst, 1.0, "EXACT_PERMANENT_ID", "HIGH"

        # --- Tier 2: Geographic Hierarchy Blocking ---
        query = self.db.query(Institution)
        if district_id:
            query = query.filter(Institution.district_id == district_id)
        elif state_id:
            query = query.join(District).filter(District.state_id == state_id)

        candidates = query.all()
        # Fallback to all institutions if geo-block is empty or not provided
        if not candidates:
            candidates = self.db.query(Institution).all()

        if not candidates:
            return None, 0.0, "UNRESOLVED", "LOW"

        # --- Tier 3: Token Normalization & Jaro-Winkler Similarity ---
        norm_query = normalize_text(cleaned_raw)
        best_inst = None
        best_score = 0.0

        for inst in candidates:
            norm_target = normalize_text(inst.name)
            score = jellyfish.jaro_winkler_similarity(norm_query, norm_target)
            
            # Also test alias variants
            for variant in inst.variants:
                v_score = jellyfish.jaro_winkler_similarity(norm_query, normalize_text(variant.alias))
                if v_score > score:
                    score = v_score

            if score > best_score:
                best_score = score
                best_inst = inst

        # --- Tier 4: Threshold Evaluation ---
        if best_score >= 0.88:
            return best_inst, round(best_score, 4), "GEO_RAPIDFUZZ_AUTO", "HIGH"
        elif best_score >= 0.70:
            return best_inst, round(best_score, 4), "FUZZY_REVIEW_QUEUE", "MEDIUM"
        else:
            return best_inst if best_score >= 0.50 else None, round(best_score, 4), "LOW_CONFIDENCE", "LOW"
