import pandas as pd

# Load PLFS Block 4
block4 = pd.read_csv(
    "data/Block_4_Demographic particulars of household members.csv"
)

# Load PLFS Block 5.1
block51 = pd.read_csv(
    "data/Block_5_1_Usual principal activity particulars of household members.csv"
)

print("Block 4:", block4.shape)
print("Block 5.1:", block51.shape)

# Select required columns
education = block4[
    [
        "HHID",
        "Person_Serial_No",
        "Age",
        "General_Education",
        "Technical_Education",
        "Vocational_Training",
        "Field_of_Training"
    ]
]

occupation = block51[
    [
        "HHID",
        "Person_Serial_No",
        "Usual_Principal_Activity_Status",
        "Usual_Principal_Activity_NCO2004"
    ]
]

# Combine both datasets
df = pd.merge(
    education,
    occupation,
    on=["HHID", "Person_Serial_No"],
    how="inner"
)

# Save the working dataset
df.to_csv("data/plfs_skill_working_dataset.csv", index=False)

print("\nFinal dataset:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 records:")
print(df.head())