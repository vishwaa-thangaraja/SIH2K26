import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Skill Gap & Recommendation System",
    page_icon="🎯",
    layout="wide"
)

st.title("🎯 Skill Gap & Recommendation System")
st.write(
    "PLFS + O*NET based occupational skill gap analysis"
)

# Load data
@st.cache_data
def load_data():
    df = pd.read_csv(
        "data/skill_recommendations.csv",
        low_memory=False
    )
    return df

df = load_data()

st.success("Dataset loaded successfully!")

# Statistics
col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        "Recommendation Records",
        f"{len(df):,}"
    )

with col2:
    st.metric(
        "NCO Occupations",
        df["NCO2004_Code"].nunique()
    )

with col3:
    st.metric(
        "Skills",
        df["Skill"].nunique()
    )

st.divider()

st.subheader("Occupation Skill Recommendations")

occupation = st.selectbox(
    "Select NCO-2004 Occupation",
    sorted(df["NCO2004_Group_Title"].dropna().unique())
)

selected = df[
    df["NCO2004_Group_Title"] == occupation
]

st.dataframe(
    selected[
        [
            "NCO2004_Code",
            "NCO2004_Group_Title",
            "ONET_Title",
            "Skill",
            "Required_Skill_Level",
            "Inferred_Skill_Score",
            "Skill_Gap"
        ]
    ],
    use_container_width=True
)