import os
import pandas as pd
from typing import List, Dict, Any, Optional

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "ml_brain", "skill_recommendations.csv")

# Global in-memory cache for fast sub-millisecond lookups
_OCCUPATION_MAP: Dict[str, List[Dict[str, Any]]] = {}
_NCO_CODE_MAP: Dict[str, List[Dict[str, Any]]] = {}
_TOP_STATEWIDE_SKILLS: List[Dict[str, Any]] = []
_LOADED = False

def load_skill_data():
    """Loads and indexes skill recommendations into fast lookup tables."""
    global _OCCUPATION_MAP, _NCO_CODE_MAP, _TOP_STATEWIDE_SKILLS, _LOADED
    if _LOADED:
        return

    if not os.path.exists(CSV_PATH):
        print(f"[WARN] Skill recommendations CSV not found at {CSV_PATH}")
        return

    print(f"[ML-BRAIN] Indexing skill recommendations from {CSV_PATH}...")
    # Read relevant columns
    df = pd.read_csv(
        CSV_PATH,
        usecols=[
            "NCO2004_Code",
            "NCO2004_Group_Title",
            "ONET_Title",
            "Skill",
            "Required_Skill_Level",
            "Inferred_Skill_Score",
            "Skill_Gap"
        ],
        low_memory=False
    )

    # Group top gaps by occupation title (deduplicated by Skill)
    grouped = df.sort_values(by="Skill_Gap", ascending=False)
    
    for title, group in grouped.groupby("NCO2004_Group_Title"):
        unique_skills = []
        seen_skills = set()
        for _, row in group.iterrows():
            skill_name = str(row["Skill"]).strip()
            if skill_name and skill_name not in seen_skills:
                seen_skills.add(skill_name)
                unique_skills.append({
                    "nco_code": str(row["NCO2004_Code"]),
                    "nco_title": str(row["NCO2004_Group_Title"]),
                    "onet_title": str(row["ONET_Title"]),
                    "skill": skill_name,
                    "required_level": round(float(row["Required_Skill_Level"]), 2),
                    "inferred_score": round(float(row["Inferred_Skill_Score"]), 2),
                    "skill_gap": round(float(row["Skill_Gap"]), 2)
                })
                if len(unique_skills) >= 5:
                    break
        _OCCUPATION_MAP[title.lower().strip()] = unique_skills

    # Index by NCO Code
    for code, group in grouped.groupby("NCO2004_Code"):
        unique_skills = []
        seen_skills = set()
        for _, row in group.iterrows():
            skill_name = str(row["Skill"]).strip()
            if skill_name and skill_name not in seen_skills:
                seen_skills.add(skill_name)
                unique_skills.append({
                    "nco_code": str(row["NCO2004_Code"]),
                    "nco_title": str(row["NCO2004_Group_Title"]),
                    "onet_title": str(row["ONET_Title"]),
                    "skill": skill_name,
                    "required_level": round(float(row["Required_Skill_Level"]), 2),
                    "inferred_score": round(float(row["Inferred_Skill_Score"]), 2),
                    "skill_gap": round(float(row["Skill_Gap"]), 2)
                })
                if len(unique_skills) >= 5:
                    break
        _NCO_CODE_MAP[str(code).strip()] = unique_skills

    # Compute top statewide cross-cutting skill gaps
    agg = df.groupby("Skill").agg({
        "Skill_Gap": "mean",
        "Required_Skill_Level": "mean",
        "NCO2004_Code": "nunique"
    }).reset_index()
    agg = agg.sort_values(by="Skill_Gap", ascending=False).head(10)
    
    _TOP_STATEWIDE_SKILLS = [
        {
            "skill": row["Skill"],
            "avg_skill_gap": round(float(row["Skill_Gap"]), 2),
            "required_level": round(float(row["Required_Skill_Level"]), 2),
            "applicable_occupations_count": int(row["NCO2004_Code"])
        }
        for _, row in agg.iterrows()
    ]

    _LOADED = True
    print(f"[ML-BRAIN] Indexed {len(_OCCUPATION_MAP)} NCO occupations & {len(_TOP_STATEWIDE_SKILLS)} statewide gaps.")

def get_recommendations_for_trade(trade_name: str) -> List[Dict[str, Any]]:
    """
    Fuzzy-matches a trainee's trade/course to NCO-2004 occupation and returns top 3-5 skill recommendations.
    """
    if not _LOADED:
        load_skill_data()

    if not trade_name:
        return _get_fallback_skills("General Engineering")

    trade_lower = trade_name.lower().strip()

    # Exact or substring match in occupation map
    for occ_title, recs in _OCCUPATION_MAP.items():
        if occ_title in trade_lower or trade_lower in occ_title:
            return recs

    # Heuristic mapping for common skilling courses in TN / MH
    if any(k in trade_lower for k in ["welder", "welding", "metal", "sheet"]):
        for key in ["metal moulders, welders, sheet metal workers", "machine tool operators"]:
            if key in _OCCUPATION_MAP:
                return _OCCUPATION_MAP[key]
    
    if any(k in trade_lower for k in ["cnc", "machinist", "lathe", "tool"]):
        for key in ["machine tool operators", "machinists, fitters"]:
            if key in _OCCUPATION_MAP:
                return _OCCUPATION_MAP[key]

    if any(k in trade_lower for k in ["electrician", "wireman", "solar"]):
        for key in ["electrical and electronic equipment mechanics", "building electricians"]:
            if key in _OCCUPATION_MAP:
                return _OCCUPATION_MAP[key]

    if any(k in trade_lower for k in ["auto", "motor", "diesel"]):
        for key in ["motor vehicle mechanics and fitters", "mechanics and fitters"]:
            if key in _OCCUPATION_MAP:
                return _OCCUPATION_MAP[key]

    if any(k in trade_lower for k in ["computer", "data", "it", "programmer"]):
        for key in ["computer systems engineers/architects", "architects, engineers and related"]:
            if key in _OCCUPATION_MAP:
                return _OCCUPATION_MAP[key]

    # Return first available group if match not found
    if _OCCUPATION_MAP:
        first_key = next(iter(_OCCUPATION_MAP))
        return _OCCUPATION_MAP[first_key]

    return _get_fallback_skills(trade_name)

def get_statewide_priority_gaps() -> List[Dict[str, Any]]:
    """Returns top macro skill gaps across all occupations."""
    if not _LOADED:
        load_skill_data()
    return _TOP_STATEWIDE_SKILLS

def _get_fallback_skills(trade: str) -> List[Dict[str, Any]]:
    """Fallback skill profile in case CSV not yet loaded."""
    return [
        {"nco_code": "721", "nco_title": trade, "onet_title": trade, "skill": "Quality Control Analysis", "required_level": 3.8, "inferred_score": 1.9, "skill_gap": 1.9},
        {"nco_code": "721", "nco_title": trade, "onet_title": trade, "skill": "Operation Monitoring & Safety", "required_level": 4.0, "inferred_score": 2.2, "skill_gap": 1.8},
        {"nco_code": "721", "nco_title": trade, "onet_title": trade, "skill": "Equipment Maintenance", "required_level": 3.5, "inferred_score": 1.8, "skill_gap": 1.7}
    ]
