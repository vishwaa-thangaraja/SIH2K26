import os
import warnings
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.pipeline import Pipeline

# Suppress minor scikit-learn cross-minor-version unpickle warnings
warnings.filterwarnings("ignore", category=UserWarning)

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

CLASSIFIER_MODEL_PATH = MODELS_DIR / "complaint_classifier.joblib"
PRIORITY_MODEL_PATH = MODELS_DIR / "complaint_priority.joblib"
BUREAU_MAPPING_PATH = DATA_DIR / "bureau_mapping.csv"
DUPLICATE_SAMPLES_PATH = DATA_DIR / "duplicate_samples.csv"
COMPLAINTS_DATA_PATH = DATA_DIR / "complaints.csv"


class MLTextIntelligenceService:
    """
    Production-grade AI/ML Text Intelligence Service for AICTE e-Governance.
    Loads and serves:
      1. Complaint Category Classifier (.joblib trained on TF-IDF + Logistic Regression)
      2. Priority Severity Predictor (.joblib trained on Regulatory Risk Taxonomy)
      3. TF-IDF Cosine Similarity Deduplication Engine
      4. Bureau Jurisdiction Router with Cell-level Disambiguation
    """

    def __init__(self):
        self.classifier_model = None
        self.priority_model = None
        self.bureau_mapping: Dict[str, str] = {}
        self.duplicate_corpus: List[str] = []
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        
        self._load_bureau_mapping()
        self._load_duplicate_corpus()
        self._load_or_train_models()

    def _load_bureau_mapping(self):
        """Load bureau routing mapping from CSV or establish enterprise defaults."""
        if BUREAU_MAPPING_PATH.is_file():
            try:
                df = pd.read_csv(BUREAU_MAPPING_PATH)
                for _, row in df.iterrows():
                    self.bureau_mapping[str(row["category"]).strip().lower()] = str(row["bureau"]).strip()
            except Exception as e:
                print(f"[MLService] Warning: Failed to parse bureau_mapping.csv: {e}")
        
        # Enterprise AICTE Bureau fallback designations
        self.bureau_code_map = {
            "fees": "PGRC",
            "admission": "PGRC",
            "examination": "PGRC",
            "other": "PGRC",
            "faculty": "RB",
            "infrastructure": "RB"
        }

    def _load_duplicate_corpus(self):
        """Seed the deduplication engine with baseline duplicate samples."""
        corpus = []
        if DUPLICATE_SAMPLES_PATH.is_file():
            try:
                df = pd.read_csv(DUPLICATE_SAMPLES_PATH)
                if "complaint" in df.columns:
                    corpus.extend([str(t).strip() for t in df["complaint"].dropna() if str(t).strip()])
            except Exception as e:
                print(f"[MLService] Warning: Failed to load duplicate_samples.csv: {e}")
        
        if COMPLAINTS_DATA_PATH.is_file():
            try:
                df = pd.read_csv(COMPLAINTS_DATA_PATH)
                if "complaint" in df.columns:
                    corpus.extend([str(t).strip() for t in df["complaint"].dropna() if str(t).strip()])
            except Exception as e:
                print(f"[MLService] Warning: Failed to load complaints.csv: {e}")

        self.duplicate_corpus = list(set(corpus))
        if self.duplicate_corpus:
            self.vectorizer.fit(self.duplicate_corpus)

    def _load_or_train_models(self):
        """Load trained .joblib models, or train and persist them if missing."""
        # 1. Category Classifier
        if CLASSIFIER_MODEL_PATH.is_file():
            try:
                self.classifier_model = joblib.load(CLASSIFIER_MODEL_PATH)
            except Exception as e:
                print(f"[MLService] Warning loading {CLASSIFIER_MODEL_PATH}: {e}. Retraining...")
                self._train_default_classifier()
        else:
            self._train_default_classifier()

        # 2. Priority Predictor
        if PRIORITY_MODEL_PATH.is_file():
            try:
                self.priority_model = joblib.load(PRIORITY_MODEL_PATH)
            except Exception as e:
                print(f"[MLService] Warning loading {PRIORITY_MODEL_PATH}: {e}. Retraining...")
                self._train_default_priority()
        else:
            self._train_default_priority()

    def _train_default_classifier(self):
        """Fallback trainer for Category Classifier using complaints.csv or seed data."""
        X_train, y_train = [], []
        if COMPLAINTS_DATA_PATH.is_file():
            try:
                df = pd.read_csv(COMPLAINTS_DATA_PATH)
                if "complaint" in df.columns and "category" in df.columns:
                    valid = df.dropna(subset=["complaint", "category"])
                    X_train = valid["complaint"].astype(str).tolist()
                    y_train = valid["category"].astype(str).tolist()
            except Exception:
                pass

        if not X_train:
            X_train = [
                "College collected excess capitation fees and refuses to refund caution deposit",
                "Tuition fee demanded during semester break violating AICTE circular",
                "Admission conducted without merit list and irregular quota management",
                "Semester examination papers leaked and internal evaluation biased",
                "Faculty members not paid AICTE 7th pay scale salaries for five months",
                "Hostel sanitation and drinking water facilities completely broken and hazardous",
                "General administrative harassment and failure of college grievance committee"
            ]
            y_train = ["Fees", "Fees", "Admission", "Examination", "Faculty", "Infrastructure", "Other"]

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42))
        ])
        pipeline.fit(X_train, y_train)
        self.classifier_model = pipeline
        try:
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            joblib.dump(pipeline, CLASSIFIER_MODEL_PATH)
        except Exception:
            pass

    def _train_default_priority(self):
        """Fallback trainer for Priority Predictor."""
        X_train = [
            "Unsafe exposed electrical wiring in a classroom",
            "Student reports harassment and fears returning to campus",
            "Broken laboratory equipment caused an injury",
            "Semester result has a missing subject mark",
            "Admission application status has not updated",
            "Fee payment is not reflected in the student account",
            "Request for a copy of the academic calendar",
            "Suggestion to improve the college notice board"
        ]
        y_train = ["High", "High", "High", "Medium", "Medium", "Medium", "Low", "Low"]

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer()),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42))
        ])
        pipeline.fit(X_train, y_train)
        self.priority_model = pipeline
        try:
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            joblib.dump(pipeline, PRIORITY_MODEL_PATH)
        except Exception:
            pass

    def classify_complaint(self, text: str) -> Tuple[str, float]:
        """Classify complaint into one of the regulatory categories with probability confidence."""
        clean_text = " ".join(text.strip().split())
        if not clean_text:
            return "Other", 0.50

        try:
            category = str(self.classifier_model.predict([clean_text])[0])
            if hasattr(self.classifier_model, "predict_proba"):
                probs = self.classifier_model.predict_proba([clean_text])[0]
                conf = float(max(probs))
            else:
                conf = 0.85
            return category, round(conf, 4)
        except Exception as e:
            print(f"[MLService] Prediction error: {e}")
            return "Other", 0.50

    def predict_priority(self, text: str) -> str:
        """Predict priority (HIGH, MEDIUM, LOW) using trained model + regulatory emergency heuristics."""
        clean_text = " ".join(text.strip().split())
        if not clean_text:
            return "LOW"

        # Check critical emergency safety triggers
        t_lower = clean_text.lower()
        emergency_keywords = [
            "danger", "hazard", "fire", "unsafe", "injury", "harassment", "ragging",
            "suicide", "threat", "police", "fir", "vigilance", "capitation fee", "withheld certificates"
        ]
        if any(kw in t_lower for kw in emergency_keywords):
            return "HIGH"

        try:
            prio = str(self.priority_model.predict([clean_text])[0]).upper()
            if prio in ["HIGH", "MEDIUM", "LOW"]:
                return prio
            return "MEDIUM"
        except Exception:
            return "MEDIUM"

    def detect_duplicate_text(self, text: str, existing_texts: List[str] = None) -> Tuple[float, bool]:
        """Compute cosine similarity score against existing complaint corpus and database cases."""
        clean_text = " ".join(text.strip().split())
        if not clean_text:
            return 0.0, False

        all_comparison_texts = list(self.duplicate_corpus)
        if existing_texts:
            all_comparison_texts.extend([t for t in existing_texts if t and t.strip()])

        if not all_comparison_texts:
            return 0.0, False

        try:
            vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
            corpus_and_query = all_comparison_texts + [clean_text]
            matrix = vec.fit_transform(corpus_and_query)
            query_vec = matrix[-1]
            corpus_vecs = matrix[:-1]
            
            sims = cosine_similarity(query_vec, corpus_vecs)[0]
            max_sim = float(np.max(sims)) if len(sims) > 0 else 0.0
            
            # Threshold >= 0.70 flags high probability duplication
            is_dup = max_sim >= 0.70
            return round(max_sim, 4), is_dup
        except Exception as e:
            print(f"[MLService] Duplicate detection error: {e}")
            return 0.0, False

    def recommend_bureau(self, category: str, priority: str = "MEDIUM") -> str:
        """
        Recommend jurisdictional bureau (PGRC vs RB) based on category and severity:
        - PGRC (Public Grievance Redressal Cell): Fees, Admissions, Examinations, Student Grievances
        - RB (Regulation Bureau / Approval Bureau): Faculty Cadres, Infrastructure Norms, Structural Violations
        """
        cat_key = category.strip().lower()
        official_bureau = self.bureau_code_map.get(cat_key)

        if not official_bureau:
            if priority.upper() == "HIGH":
                official_bureau = "RB"
            else:
                official_bureau = "PGRC"

        # Look up descriptive cell name if present
        cell_desc = self.bureau_mapping.get(cat_key)
        if cell_desc:
            # Clean up demonstration prefix if present
            clean_cell = cell_desc.replace("Demonstration cell: ", "").strip()
            return f"{official_bureau} ({clean_cell})"

        return official_bureau


# Global singleton instance
ml_service = MLTextIntelligenceService()
