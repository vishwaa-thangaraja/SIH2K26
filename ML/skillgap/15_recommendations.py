import pandas as pd

# Load skill-gap data
df = pd.read_csv(
    "data/skill_gap_dataset.csv"
)

# Keep only actual gaps
gaps = df[df["Skill_Gap"] > 0].copy()

# Rank skills by gap for each person
gaps["Skill_Rank"] = (
    gaps.groupby(
        ["HHID", "Person_Serial_No"]
    )["Skill_Gap"]
    .rank(
        ascending=False,
        method="first"
    )
)

# Keep top 3 missing skills
recommendations = gaps[
    gaps["Skill_Rank"] <= 3
].copy()

# Select useful columns
recommendations = recommendations[
    [
        "HHID",
        "Person_Serial_No",
        "NCO2004_Code",
        "NCO2004_Group_Title",
        "ONET_Title",
        "Skill",
        "Required_Skill_Level",
        "Inferred_Skill_Score",
        "Skill_Gap"
    ]
]

# Sort
recommendations = recommendations.sort_values(
    ["HHID", "Person_Serial_No", "Skill_Gap"],
    ascending=[True, True, False]
)

# Save
recommendations.to_csv(
    "data/skill_recommendations.csv",
    index=False
)

print("Total recommendations:", len(recommendations))

print("\nTop recommendations:")
print(
    recommendations.head(20).to_string(index=False)
)

print("\nSaved:")
print("data/skill_recommendations.csv")