import joblib
import numpy as np


# -------------------------------
# Load trained files
# -------------------------------

model = joblib.load(
    "isolation_forest.joblib"
)

scaler = joblib.load(
    "scaler.joblib"
)


# -------------------------------
# Function for prediction
# -------------------------------

def detect_anomaly(
    training_duration,
    attendance_percentage,
    number_of_certifications,
    certifications_per_month,
    assessment_score,
    number_of_training_programs,
    training_gap
):

    data = np.array([[
        training_duration,
        attendance_percentage,
        number_of_certifications,
        certifications_per_month,
        assessment_score,
        number_of_training_programs,
        training_gap
    ]])


    # Scale input

    data_scaled = scaler.transform(data)


    # Prediction

    prediction = model.predict(data_scaled)[0]


    # Anomaly score

    score = model.decision_function(data_scaled)[0]


    # Decide status

    if prediction == 1:
        status = "Normal"

    elif score < -0.10:
        status = "Highly Anomalous"

    else:
        status = "Suspicious"


    return {
        "anomaly_score": round(float(score), 4),
        "status": status
    }


# -------------------------------
# Test normal trainee
# -------------------------------

normal_result = detect_anomaly(
    training_duration=180,
    attendance_percentage=92,
    number_of_certifications=2,
    certifications_per_month=0.33,
    assessment_score=87,
    number_of_training_programs=1,
    training_gap=0
)

print("\nNORMAL TRAINEE")

print(normal_result)


# -------------------------------
# Test suspicious trainee
# -------------------------------

anomaly_result = detect_anomaly(
    training_duration=3,
    attendance_percentage=100,
    number_of_certifications=17,
    certifications_per_month=170,
    assessment_score=99,
    number_of_training_programs=1,
    training_gap=0
)

print("\nSUSPICIOUS TRAINEE")

print(anomaly_result)
