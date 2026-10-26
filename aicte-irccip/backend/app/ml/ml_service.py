import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity

CATEGORIES = ["Admission", "Examination", "Faculty", "Fees", "Infrastructure", "Other"]

# Seed training corpus for out-of-the-box training
SEED_CORPUS = [
    ("College collected excess capitation fees and refuses to refund caution deposit", "Fees"),
    ("Students forced to pay unapproved development fee without official receipt", "Fees"),
    ("Tuition fee demanded during semester break violating AICTE circular", "Fees"),
    ("Admission conducted without merit list and irregular quota management", "Admission"),
    ("Direct lateral entry seats filled illegally without university notification", "Admission"),
    ("Cancellation of admission requested but college withheld original certificates", "Admission"),
    ("Semester examination papers leaked and internal evaluation biased", "Examination"),
    ("End semester timetable delayed causing clash with national entrance tests", "Examination"),
    ("Hall tickets withheld arbitrarily citing fake fee arrears", "Examination"),
    ("Faculty members not paid AICTE 7th pay scale salaries for five consecutive months", "Faculty"),
    ("Unqualified assistant professors teaching postgraduate subjects without PhD or NET", "Faculty"),
    ("Faculty student ratio is 1 to 40 instead of prescribed 1 to 15 cadre norms", "Faculty"),
    ("No computer laboratories and library lacks mandatory technical journals and books", "Infrastructure"),
    ("Campus building lacks fire safety clearance and structural stability certificate", "Infrastructure"),
    ("Hostel sanitation and drinking water facilities completely broken and hazardous", "Infrastructure"),
    ("General administrative harassment and failure of college grievance committee to meet", "Other"),
    ("Hostel warden misbehaviour and arbitrary fines levied on day scholars", "Other"),
]

class MLTextIntelligenceService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        self.clf = LogisticRegression(max_iter=200)
        self._fit_initial_models()

    def _fit_initial_models(self):
        texts = [item[0] for item in SEED_CORPUS]
        labels = [item[1] for item in SEED_CORPUS]
        X = self.vectorizer.fit_transform(texts)
        self.clf.fit(X, labels)

    def classify_complaint(self, text: str) -> Tuple[str, float]:
        """Classify complaint into one of 6 regulatory categories with confidence score."""
        if not text.strip():
            return "Other", 0.50
        X_test = self.vectorizer.transform([text])
        probs = self.clf.predict_proba(X_test)[0]
        max_idx = np.argmax(probs)
        return self.clf.classes_[max_idx], round(float(probs[max_idx]), 4)

    def predict_priority(self, text: str) -> str:
        """Predict priority level: Low, Medium, High based on regulatory severity signals."""
        t_lower = text.lower()
        high_severity_keywords = [
            "fire", "safety", "hazard", "ragging", "harassment", "suicide", "salary",
            "unpaid", "months", "court", "cbi", "vigilance", "withheld certificates",
            "show cause", "closure", "capitation"
        ]
        if any(kw in t_lower for kw in high_severity_keywords):
            return "HIGH"
        elif len(t_lower.split()) > 25:
            return "MEDIUM"
        else:
            return "LOW"

    def detect_duplicate_text(self, text: str, existing_texts: List[str]) -> Tuple[float, bool]:
        """Compute maximum cosine similarity against existing complaint corpus to detect duplicates."""
        if not existing_texts or not text.strip():
            return 0.0, False
        
        all_texts = existing_texts + [text]
        vecs = self.vectorizer.transform(all_texts)
        query_vec = vecs[-1]
        corpus_vecs = vecs[:-1]
        
        similarities = cosine_similarity(query_vec, corpus_vecs)[0]
        max_sim = float(np.max(similarities)) if len(similarities) > 0 else 0.0
        
        # Cosine threshold >= 0.75 indicates probable duplicate
        is_dup = max_sim >= 0.75
        return round(max_sim, 4), is_dup

    def recommend_bureau(self, category: str, priority: str = "MEDIUM") -> str:
        """
        Rule-based recommendation mapping:
        - Fees, Admission, Student Welfare -> PGRC (Public Grievance Redressal Cell)
        - Faculty Cadre, Infrastructure Norms, Structural Violations, High-Severity Matters -> RB (Regulation Bureau)
        """
        cat_upper = category.upper()
        if cat_upper in ["FEES", "ADMISSION", "EXAMINATION", "OTHER"]:
            return "PGRC"
        elif cat_upper in ["FACULTY", "INFRASTRUCTURE"]:
            return "RB"
        else:
            return "RB" if priority == "HIGH" else "PGRC"

# Global singleton instance
ml_service = MLTextIntelligenceService()
