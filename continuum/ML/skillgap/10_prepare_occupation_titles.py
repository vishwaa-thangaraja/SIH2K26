import pandas as pd


# Read NCO-2004 groups
nco = pd.read_csv(
    "data/nco2004_group_mapping.csv"
)

# Read O*NET occupations
onet = pd.read_excel(
    "data/Occupation Data.xlsx"
)


def clean_title(text):
    text = str(text).lower()
    text = " ".join(text.split())
    return text


# Clean NCO titles
nco["Clean_Title"] = nco["NCO2004_Group_Title"].apply(
    clean_title
)

# Clean O*NET titles
onet["Clean_Title"] = onet["Title"].apply(
    clean_title
)


# Save prepared files
nco.to_csv(
    "data/nco2004_titles_prepared.csv",
    index=False
)

onet.to_csv(
    "data/onet_titles_prepared.csv",
    index=False
)


print("NCO groups:", len(nco))
print("O*NET occupations:", len(onet))

print("\nNCO sample:")
print(
    nco[
        ["NCO2004_Code", "NCO2004_Group_Title", "Clean_Title"]
    ].head(10).to_string(index=False)
)

print("\nO*NET sample:")
print(
    onet[
        ["O*NET-SOC Code", "Title", "Clean_Title"]
    ].head(10).to_string(index=False)
)

print("\nFiles saved successfully.")