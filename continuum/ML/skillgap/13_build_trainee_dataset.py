import pandas as pd

# Load PLFS working dataset
df = pd.read_csv(
    "data/plfs_skill_working_dataset.csv",
    low_memory=False
)

# Convert NCO code
df["Usual_Principal_Activity_NCO2004"] = pd.to_numeric(
    df["Usual_Principal_Activity_NCO2004"],
    errors="coerce"
)

df = df.dropna(
    subset=["Usual_Principal_Activity_NCO2004"]
)

df["NCO2004_Code"] = (
    df["Usual_Principal_Activity_NCO2004"]
    .astype(int)
)

# Keep useful trainee information
trainee = df[
    [
        "HHID",
        "Person_Serial_No",
        "Age",
        "General_Education",
        "Technical_Education",
        "Vocational_Training",
        "Field_of_Training",
        "Usual_Principal_Activity_Status",
        "NCO2004_Code"
    ]
].copy()

# Save
trainee.to_csv(
    "data/trainee_skill_input.csv",
    index=False
)

print("Trainee records:", len(trainee))
print("Unique NCO groups:", trainee["NCO2004_Code"].nunique())

print("\nSample:")
print(
    trainee.head(10).to_string(index=False)
)

print("\nSaved:")
print("data/trainee_skill_input.csv")