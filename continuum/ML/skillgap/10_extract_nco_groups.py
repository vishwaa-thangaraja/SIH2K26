import re
import pandas as pd
import pdfplumber

PDF_FILE = "Concordancetable.pdf"
PLFS_CODES = "data/clean_nco2004_occupations.csv"
OUTPUT_FILE = "data/nco2004_group_mapping.csv"

# Read the NCO codes appearing in PLFS
plfs = pd.read_csv(PLFS_CODES)
wanted_codes = set(
    plfs["NCO2004_Code"].astype(str).str.zfill(3)
)

rows = []

# Read PDF
with pdfplumber.open(PDF_FILE) as pdf:
    for page in pdf.pages:
        text = page.extract_text() or ""

        for line in text.splitlines():

            # Example:
            # Group 313 Optical and Electronic Equipment Operators
            match = re.match(
                r"Group\s+(\d{3})\s+(.+)",
                line.strip()
            )

            if match:
                code = match.group(1)
                title = match.group(2).strip()

                if code in wanted_codes:
                    rows.append({
                        "NCO2004_Code": code,
                        "NCO2004_Group_Title": title
                    })

# Remove duplicates
result = pd.DataFrame(rows).drop_duplicates()

# Sort
result = result.sort_values("NCO2004_Code")

# Save
result.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Groups found:", len(result))
print("\nFirst results:")
print(result.head(20))

print("\nSaved:")
print(OUTPUT_FILE)