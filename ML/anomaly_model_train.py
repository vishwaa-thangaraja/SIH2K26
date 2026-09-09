import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# -------------------------------
# 1. Load dataset
# -------------------------------

data = pd.read_csv("dataset.csv")


# -------------------------------
# 2. Select ML features
# -------------------------------

feature_names = [
    "training_duration",
    "attendance_percentage",
    "number_of_certifications",
    "certifications_per_month",
    "assessment_score",
    "number_of_training_programs",
    "training_gap"
]

X = data[feature_names]


# -------------------------------
# 3. Scale the data
# -------------------------------

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# -------------------------------
# 4. Create Isolation Forest model
# -------------------------------

model = IsolationForest(
    n_estimators=200,
    contamination=0.15,
    random_state=42
)


# -------------------------------
# 5. Train the model
# -------------------------------

model.fit(X_scaled)


# -------------------------------
# 6. Predict anomalies
# -------------------------------

data["prediction"] = model.predict(X_scaled)

data["anomaly_score"] = model.decision_function(X_scaled)


# -------------------------------
# 7. Convert prediction to status
# -------------------------------

def get_status(row):

    if row["prediction"] == 1:
        return "Normal"

    if row["anomaly_score"] < -0.10:
        return "Highly Anomalous"

    return "Suspicious"


data["status"] = data.apply(get_status, axis=1)


# -------------------------------
# 8. Display results
# -------------------------------

print("\nANOMALY DETECTION RESULTS\n")

print(
    data[
        [
            "trainee_id",
            "anomaly_score",
            "status"
        ]
    ]
)


# -------------------------------
# 9. Save model
# -------------------------------

joblib.dump(model, "isolation_forest.joblib")


# -------------------------------
# 10. Save scaler
# -------------------------------

joblib.dump(scaler, "scaler.joblib")


# -------------------------------
# 11. Save feature names
# -------------------------------

joblib.dump(feature_names, "feature_names.joblib")


# -------------------------------
# 12. Save results
# -------------------------------

data.to_csv(
    "anomaly_results.csv",
    index=False
)


print("\nModel trained successfully!")

print("Files created:")
print("1. isolation_forest.joblib")
print("2. scaler.joblib")
print("3. feature_names.joblib")
print("4. anomaly_results.csv")
