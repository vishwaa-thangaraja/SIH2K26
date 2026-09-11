import pandas as pd

df = pd.read_csv(
    "data/plfs_skill_working_dataset.csv",
    low_memory=False
)

codes = (
    df["Usual_Principal_Activity_NCO2004"]
    .dropna()
    .astype(str)
)

print(codes.head(30).to_list())

print("\nSample unique codes:")
print(codes.unique()[:100])