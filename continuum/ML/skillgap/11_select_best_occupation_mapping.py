import pandas as pd

# Load top-3 candidates
mapping = pd.read_csv(
    "data/nco2004_onet_top3_candidates.csv"
)

# Load O*NET skills
skills = pd.read_csv(
    "data/onet_essential_skills.csv"
)

# Count skills available for each O*NET occupation
skill_counts = (
    skills.groupby("ONET_SOC_Code")
    .size()
    .reset_index(name="Skill_Count")
)

# Add skill count to candidates
mapping = mapping.merge(
    skill_counts,
    on="ONET_SOC_Code",
    how="left"
)

mapping["Skill_Count"] = mapping["Skill_Count"].fillna(0)

# Score candidates
mapping["Final_Score"] = (
    mapping["Similarity_Score"] * 0.7
    + (mapping["Skill_Count"] / 10) * 0.3
)

# Select best candidate for each NCO group
best = (
    mapping.sort_values(
        ["NCO2004_Code", "Final_Score"],
        ascending=[True, False]
    )
    .groupby("NCO2004_Code")
    .head(1)
)

best = best.sort_values("NCO2004_Code")

best.to_csv(
    "data/nco2004_best_mapping.csv",
    index=False
)

print("Mappings selected:", len(best))

print("\nMappings:")
print(
    best[
        [
            "NCO2004_Code",
            "NCO2004_Group_Title",
            "ONET_SOC_Code",
            "ONET_Title",
            "Similarity_Score",
            "Skill_Count",
            "Final_Score"
        ]
    ].head(30).to_string(index=False)
)

print(
    "\nSaved: data/nco2004_best_mapping.csv"
)