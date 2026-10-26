import pandas as pd

df = pd.read_csv(
    "data/plfs_skill_working_dataset.csv",
    low_memory=False
)

# Convert occupation code to numeric
df["Usual_Principal_Activity_NCO2004"] = pd.to_numeric(
    df["Usual_Principal_Activity_NCO2004"],
    errors="coerce"
)

# Remove missing occupation codes
df = df.dropna(
    subset=["Usual_Principal_Activity_NCO2004"]
)

# Convert to 3-digit integer code
df["NCO2004_Code"] = (
    df["Usual_Principal_Activity_NCO2004"]
    .astype(int)
)

# Get unique occupation codes with counts
occupation_counts = (
    df["NCO2004_Code"]
    .value_counts()
    .reset_index()
)

occupation_counts.columns = ["NCO2004_Code", "Count"]

# Sort by occupation code
occupation_counts = occupation_counts.sort_values(
    "NCO2004_Code"
)

# Save
occupation_counts.to_csv(
    "data/clean_nco2004_occupations.csv",
    index=False
)

print("Unique NCO-2004 occupation codes:",
      len(occupation_counts))

print("\nFirst 30:")
print(occupation_counts.head(30))

print("\nSaved:")
print("data/clean_nco2004_occupations.csv")