import pandas as pd

# Load trainee data
trainee = pd.read_csv(
    "data/trainee_skill_input.csv",
    low_memory=False
)

# Load O*NET skill requirements
skills = pd.read_csv(
    "data/final_skill_requirements.csv"
)

# --------------------------------------------------
# Create a simple inferred skill score
# --------------------------------------------------

trainee["Education_Score"] = (
    pd.to_numeric(
        trainee["General_Education"],
        errors="coerce"
    ).fillna(0)
)

trainee["Technical_Score"] = (
    pd.to_numeric(
        trainee["Technical_Education"],
        errors="coerce"
    ).fillna(0)
)

trainee["Vocational_Score"] = (
    pd.to_numeric(
        trainee["Vocational_Training"],
        errors="coerce"
    ).fillna(0)
)

# Normalize into 0-5 range
trainee["Inferred_Skill_Score"] = (
    trainee["Education_Score"] +
    trainee["Technical_Score"] +
    trainee["Vocational_Score"]
)

# Scale to 0-5
max_score = trainee["Inferred_Skill_Score"].max()

if max_score > 0:
    trainee["Inferred_Skill_Score"] = (
        trainee["Inferred_Skill_Score"] /
        max_score
    ) * 5

# --------------------------------------------------
# Merge trainee occupation with required skills
# --------------------------------------------------

gap = trainee.merge(
    skills,
    on="NCO2004_Code",
    how="inner"
)

# --------------------------------------------------
# Calculate Skill Gap
# --------------------------------------------------

gap["Skill_Gap"] = (
    gap["Required_Skill_Level"] -
    gap["Inferred_Skill_Score"]
)

# Negative gaps are set to zero
gap["Skill_Gap"] = gap["Skill_Gap"].clip(lower=0)

# --------------------------------------------------
# Save
# --------------------------------------------------

gap.to_csv(
    "data/skill_gap_dataset.csv",
    index=False
)

print("Trainee records:", len(trainee))
print("Skill-gap records:", len(gap))

print("\nSample:")
print(
    gap[
        [
            "NCO2004_Code",
            "NCO2004_Group_Title",
            "Skill",
            "Required_Skill_Level",
            "Inferred_Skill_Score",
            "Skill_Gap"
        ]
    ].head(20).to_string(index=False)
)

print("\nSaved:")
print("data/skill_gap_dataset.csv")