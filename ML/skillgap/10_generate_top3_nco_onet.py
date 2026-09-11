import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Load data
nco = pd.read_csv("data/nco2004_titles_prepared.csv")
onet = pd.read_excel("data/Occupation Data.xlsx")


# Clean titles
nco["Title"] = nco["NCO2004_Group_Title"].fillna("").str.lower()
onet["Title_Clean"] = onet["Title"].fillna("").str.lower()


# TF-IDF using titles only
vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2)
)

all_titles = pd.concat([
    nco["Title"],
    onet["Title_Clean"]
])

vectorizer.fit(all_titles)


nco_vectors = vectorizer.transform(nco["Title"])
onet_vectors = vectorizer.transform(onet["Title_Clean"])


# Calculate similarity
similarity = cosine_similarity(
    nco_vectors,
    onet_vectors
)


rows = []

for i in range(len(nco)):

    scores = similarity[i]

    # Top 3
    top3 = scores.argsort()[-3:][::-1]

    for rank, index in enumerate(top3, start=1):

        rows.append({
            "NCO2004_Code":
            nco.iloc[i]["NCO2004_Code"],

            "NCO2004_Group_Title":
            nco.iloc[i]["NCO2004_Group_Title"],

            "Rank":
            rank,

            "ONET_SOC_Code":
            onet.iloc[index]["O*NET-SOC Code"],

            "ONET_Title":
            onet.iloc[index]["Title"],

            "Similarity_Score":
            round(scores[index], 4)
        })


result = pd.DataFrame(rows)


result.to_csv(
    "data/nco2004_onet_top3_candidates.csv",
    index=False
)


print("NCO groups:", len(nco))
print("Candidate mappings:", len(result))

print("\nFirst 15 NCO groups:")
print(
    result.head(45).to_string(index=False)
)

print(
    "\nSaved: "
    "data/nco2004_onet_top3_candidates.csv"
)