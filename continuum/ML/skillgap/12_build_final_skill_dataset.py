import pandas as pd

# Load selected occupation mapping
mapping = pd.read_csv(
    "data/nco2004_best_mapping.csv"
)

# Load O*NET essential skills
skills = pd.read_csv(
    "data/onet_essential_skills.csv"
)

# Keep required columns
skills = skills[
    [
        "ONET_SOC_Code",
        "Occupation_Title",
        "Skill",
        "Required_Skill_Level"
    ]
]

# Connect NCO → O*NET → Skills
final = mapping.merge(
    skills,
    on="ONET_SOC_Code",
    how="inner"
)

# Select useful columns
final = final[
    [
        "NCO2004_Code",
        "NCO2004_Group_Title",
        "ONET_SOC_Code",
        "ONET_Title",
        "Skill",
        "Required_Skill_Level"
    ]
]

# Remove duplicate rows
final = final.drop_duplicates()

# Save
final.to_csv(
    "data/final_skill_requirements.csv",
    index=False
)

print("NCO groups:", final["NCO2004_Code"].nunique())
print("Skill records:", len(final))

print("\nSample:")
print(
    final.head(20).to_string(index=False)
)

print("\nSaved:")
print("data/final_skill_requirements.csv")