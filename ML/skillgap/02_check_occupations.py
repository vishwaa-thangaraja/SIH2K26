import pandas as pd

df = pd.read_csv(
    "data/plfs_skill_working_dataset.csv",
    low_memory=False
)

# Count occupation codes
occupations = (
    df["Usual_Principal_Activity_NCO2004"]
    .dropna()
    .astype(str)
    .value_counts()
)

print("Total different occupation codes:", len(occupations))

print("\nTop 30 occupation codes:")
print(occupations.head(30))

# Save the occupation list
occupations.to_csv(
    "data/plfs_occupation_codes.csv",
    header=["Count"]
)

print("\nSaved: data/plfs_occupation_codes.csv")