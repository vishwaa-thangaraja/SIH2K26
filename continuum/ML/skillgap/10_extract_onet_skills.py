import pandas as pd

INPUT_FILE = "data/Essential Skills.xlsx"
OUTPUT_FILE = "data/onet_essential_skills.csv"

df = pd.read_excel(INPUT_FILE)

# Keep only skill level records
skills = df[df["Scale ID"] == "LV"].copy()

# Keep required columns
skills = skills[
    [
        "O*NET-SOC Code",
        "Title",
        "Element Name",
        "Data Value"
    ]
]

# Rename columns
skills.columns = [
    "ONET_SOC_Code",
    "Occupation_Title",
    "Skill",
    "Required_Skill_Level"
]

# Remove missing values
skills = skills.dropna(
    subset=["ONET_SOC_Code", "Skill", "Required_Skill_Level"]
)

# Save
skills.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Rows:", len(skills))
print("\nFirst results:")
print(skills.head(20).to_string(index=False))

print("\nSaved:")
print(OUTPUT_FILE)