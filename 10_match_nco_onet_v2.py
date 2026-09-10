import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Read files
nco = pd.read_csv("data/nco2004_titles_prepared.csv")
onet = pd.read_excel("data/Occupation Data.xlsx")


# Clean text
nco["Search_Text"] = nco["NCO2004_Group_Title"].fillna("").str.lower()

onet["Search_Text"] = (
    onet["Title"].fillna("") + " " +
    onet["Description"].fillna("")
).str.lower()


# TF-IDF
vectorizer = TfidfVectorizer(
    stop_words="english",
    ngram_range=(1, 2)
)

all_text = pd.concat(
    [nco["Search_Text"], onet["Search_Text"]]
)

vectorizer.fit(all_text)


nco_vectors = vectorizer.transform(nco["Search_Text"])
onet_vectors = vectorizer.transform(onet["Search_Text"])


# Similarity
similarity = cosine_similarity(
    nco_vectors,
    onet_vectors
)


# Best match
rows = []

for i in range(len(nco)):

    best_index = similarity[i].argmax()

    rows.append({
        "NCO2004_Code": nco.iloc[i]["NCO2004_Code"],
        "NCO2004_Group_Title": nco.iloc[i]["NCO2004_Group_Title"],
        "ONET_SOC_Code": onet.iloc[best_index]["O*NET-SOC Code"],
        "ONET_Title": onet.iloc[best_index]["Title"],
        "Similarity_Score": round(
            similarity[i][best_index], 4
        )
    })


result = pd.DataFrame(rows)

result = result.sort_values(
    "Similarity_Score"
)

result.to_csv(
    "data/nco2004_onet_similarity_mapping_v2.csv",
    index=False
)


print("Mappings created:", len(result))

print("\nLowest 20 matches:")
print(
    result.head(20).to_string(index=False)
)

print("\nHighest 20 matches:")
print(
    result.tail(20).to_string(index=False)
)

print("\nSaved:")
print(
    "data/nco2004_onet_similarity_mapping_v2.csv"
)