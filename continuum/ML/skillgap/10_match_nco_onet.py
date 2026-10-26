import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Read prepared occupation files
nco = pd.read_csv(
    "data/nco2004_titles_prepared.csv"
)

onet = pd.read_csv(
    "data/onet_titles_prepared.csv"
)


# Create TF-IDF vectors
vectorizer = TfidfVectorizer(
    stop_words="english"
)

all_titles = pd.concat(
    [nco["Clean_Title"], onet["Clean_Title"]]
)

vectorizer.fit(all_titles)


nco_vectors = vectorizer.transform(
    nco["Clean_Title"]
)

onet_vectors = vectorizer.transform(
    onet["Clean_Title"]
)


# Calculate similarity
similarity = cosine_similarity(
    nco_vectors,
    onet_vectors
)


# Find best O*NET match for each NCO group
rows = []

for i in range(len(nco)):

    best_index = similarity[i].argmax()
    best_score = similarity[i][best_index]

    rows.append({
        "NCO2004_Code": nco.iloc[i]["NCO2004_Code"],
        "NCO2004_Group_Title": nco.iloc[i]["NCO2004_Group_Title"],
        "ONET_SOC_Code": onet.iloc[best_index]["O*NET-SOC Code"],
        "ONET_Title": onet.iloc[best_index]["Title"],
        "Similarity_Score": round(best_score, 4)
    })


result = pd.DataFrame(rows)


# Sort by NCO code
result = result.sort_values(
    "NCO2004_Code"
)


# Save result
result.to_csv(
    "data/nco2004_onet_similarity_mapping.csv",
    index=False
)


print("Mappings created:", len(result))

print("\nFirst 20 mappings:")
print(
    result.head(20).to_string(index=False)
)

print("\nSaved:")
print(
    "data/nco2004_onet_similarity_mapping.csv"
)