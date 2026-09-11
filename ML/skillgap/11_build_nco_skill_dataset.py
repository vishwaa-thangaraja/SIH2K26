import pandas as pd

# Load occupation candidates
mapping = pd.read_csv(
    "data/nco2004_onet_top3_candidates.csv"
)

# Load O*NET essential skills
skills = pd.read_csv(
    "data/onet_essential_skills.csv"
)

# Keep only required columns
skills = skills[
    [
        "ONET_SOC_Code",
        "Occupation_Title",
        "Skill",
        "Required_Skill_Level"
    ]
]

# Use only the best candidate (Rank 1)
best = mapping[
    mapping["Rank"] == 1
].copy()

# Merge NCO occupation with O*NET skills
result = best.merge(
    skills,
    left_on="ONET_SOC_Code",
    right_on="ONET_SOC_Code",
    how="left"
)

# Save
result.to_csv(
    "data/nco2004_skill_requirements.csv",
    index=False
)

print("NCO groups:", best["NCO2004_Code"].nunique())
print("Skill records:", len(result))

print("\nSample:")
print(
    result.head(20).to_string(index=False)
)

print(
    "\nSaved: data/nco2004_skill_requirements.csv"
)