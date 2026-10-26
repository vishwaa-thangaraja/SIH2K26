import os
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from models.trainee import Trainee

MATCH_THRESHOLD = 0.88  # Predefined threshold for duplicate notification

def jaro_winkler_similarity(s1: str, s2: str) -> float:
    """
    Standard Jaro-Winkler string similarity metric (pure Python, 0 dependency).
    Matches the compare.string(method='jarowinkler') behavior in ML/Identity_check_op.
    """
    s1, s2 = s1.lower().strip(), s2.lower().strip()
    if s1 == s2:
        return 1.0
    if not s1 or not s2:
        return 0.0

    len1, len2 = len(s1), len(s2)
    match_distance = max(len1, len2) // 2 - 1

    s1_matches = [False] * len1
    s2_matches = [False] * len2

    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    jaro = (
        (matches / len1) +
        (matches / len2) +
        ((matches - transpositions / 2) / matches)
    ) / 3.0

    # Winkler prefix scale (standard p = 0.1, max 4 chars)
    prefix = 0
    for i in range(min(4, min(len1, len2))):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    return jaro + (prefix * 0.1 * (1.0 - jaro))

def calculate_entity_similarity(
    candidate_name: str,
    candidate_phone: Optional[str],
    candidate_email: Optional[str],
    candidate_district: Optional[str],
    existing_trainee: Trainee
) -> float:
    """
    Multi-attribute similarity weighted matching:
    - Name similarity (Jaro-Winkler): 45%
    - Phone / Mobile match: 35%
    - Email similarity: 10%
    - District / Location match: 10%
    """
    # 1. Name Match
    name_sim = jaro_winkler_similarity(candidate_name or "", existing_trainee.name or "")

    # 2. Phone Match (exact normalized last 10 digits)
    phone_sim = 0.0
    p1 = "".join(c for c in (candidate_phone or "") if c.isdigit())[-10:]
    p2 = "".join(c for c in (existing_trainee.phone or "") if c.isdigit())[-10:]
    if p1 and p2:
        if p1 == p2:
            phone_sim = 1.0
        elif p1[-8:] == p2[-8:]:
            phone_sim = 0.8

    # 3. Email Match
    email_sim = 0.0
    e1 = (candidate_email or "").strip().lower()
    e2 = (existing_trainee.email or "").strip().lower()
    if e1 and e2:
        if e1 == e2:
            email_sim = 1.0
        else:
            email_sim = jaro_winkler_similarity(e1, e2)

    # 4. District Match
    district_sim = 0.0
    d1 = (candidate_district or "").strip().lower()
    d2 = (existing_trainee.district or "").strip().lower()
    if d1 and d2 and (d1 == d2 or d1 in d2 or d2 in d1):
        district_sim = 1.0

    # Weighted Ensemble Score
    if phone_sim == 1.0:
        # If phone matches identically, high weight to phone + name
        total_score = (name_sim * 0.50) + (phone_sim * 0.40) + (district_sim * 0.10)
    else:
        total_score = (name_sim * 0.55) + (phone_sim * 0.25) + (email_sim * 0.10) + (district_sim * 0.10)

    return round(float(total_score), 4)

def check_for_duplicates(
    name: str,
    phone: Optional[str],
    email: Optional[str],
    district: Optional[str],
    db: Session
) -> Dict[str, Any]:
    """
    Evaluates an incoming candidate record against all database trainees.
    Implements the duplicate user decision logic:
    - Score >= threshold: prompts confirmation ('Are these users the same?')
    - Score < threshold: treated as a clean new user.
    """
    trainees = db.exec(select(Trainee)).all()
    
    best_score = 0.0
    matched_trainee = None

    for t in trainees:
        score = calculate_entity_similarity(name, phone, email, district, t)
        if score > best_score:
            best_score = score
            matched_trainee = t

    is_duplicate = best_score >= MATCH_THRESHOLD

    result = {
        "candidate_name": name,
        "is_duplicate_candidate": is_duplicate,
        "similarity_score": round(best_score * 100, 1),
        "threshold_pct": round(MATCH_THRESHOLD * 100, 1),
        "matched_trainee": None,
        "action_required": "PROMPT_CONFIRMATION" if is_duplicate else "AUTO_ADD_NEW"
    }

    if matched_trainee and best_score >= 0.65:
        result["matched_trainee"] = {
            "trainee_id": matched_trainee.trainee_id,
            "name": matched_trainee.name,
            "phone": matched_trainee.phone,
            "email": matched_trainee.email,
            "provider": matched_trainee.provider,
            "program": matched_trainee.program,
            "district": matched_trainee.district
        }

    return result
