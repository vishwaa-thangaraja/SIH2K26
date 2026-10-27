# CASELINK ML

CASELINK provides small, independent Python modules to categorize complaints, find possible duplicates, suggest priority, and demonstrate category-to-cell routing.

## Setup

Use Python 3.10 or newer. From the project root:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Data formats

`data/complaints.csv` requires `complaint,category`. Blank rows are dropped. `data/priority_samples.csv` requires `complaint,priority`; its current rows are synthetic demonstration examples, not reviewed historical labels. `data/duplicate_samples.csv` requires `complaint`. `data/bureau_mapping.csv` requires `category,bureau` and is an editable demonstration mapping, not an official AICTE responsibility list. Replace demo data with approved data before operational use; do not include confidential personal information in samples.

## Classification

```powershell
python train_classifier.py
python predict.py
python predict.py "My examination result is missing marks"
```

The classifier uses a TF-IDF + Logistic Regression pipeline. The script evaluates a stratified holdout when class counts allow, writes `reports/classification_evaluation.json`, and then fits the saved pipeline on all valid rows at `models/complaint_classifier.joblib`. Current data has only 36 synthetic records, so holdout scores are unstable and do not predict real-world performance. The displayed confidence estimate is an uncalibrated model score.

## Possible duplicate detection

```powershell
python detect_duplicates.py
python detect_duplicates.py "Hall ticket download is failing" --threshold 0.25 --max-results 5
```

This is a TF-IDF/cosine-similarity baseline, not a trained duplicate classifier. It flags possible matches for staff review and never merges or deletes records.

## Priority suggestion

```powershell
python train_priority.py
python predict_priority.py
python predict_priority.py "Unsafe electrical wiring in the classroom"
```

The supplied labels are synthetic. A baseline TF-IDF + Logistic Regression model is trained and evaluated with a holdout only when enough labels exist; results are written to `reports/priority_evaluation.json`, and the model to `models/complaint_priority.joblib`. Without a saved model, a transparent keyword rule returns a rough suggestion. These outputs are not authoritative, and staff must review and override them. Demo features use complaint text only; no post-decision information is included.

## Bureau/cell suggestion

```powershell
python recommend_bureau.py Fees
python recommend_bureau.py Fees --override "Chosen department"
```

Routing is a rule lookup against the editable demo CSV, with an optional user override. No mapping is asserted to be official.

## Evaluation and tests

```powershell
python evaluate_models.py
python -m pytest
```

Model files are stored under `models/`; JSON evaluation reports are stored under `reports/`. The tests use temporary files or in-memory fits; they do not overwrite the existing complaint CSV.

## Optional API

Install the dependencies in `requirements.txt`, then run:

```powershell
uvicorn api:app --reload
```

Endpoints: `GET /health`, `POST /predict/category`, `POST /detect/duplicates`, `POST /predict/priority`, and `POST /recommend/bureau`. FastAPI validates request fields. Models are loaded from disk on first prediction by the current standalone functions; for a production deployment, initialize/cache them in application lifespan. The API does not connect to a database.

## Limitations and data practice

The 36 classification examples and the priority data are synthetic and too small to support reliable operational decisions. Similarity, category, and priority results are suggestions for staff review. Add representative, approved, consistently labeled historical examples and use a separately held-out evaluation set before considering deployment. Avoid personally identifying or confidential complaint information. Duplicate detection does not make automatic record changes.
