import os
import joblib
import json
from app.ml.preprocessing.leakage_cleaner import clean_document
from app.ml.services.input_diagnostics import InputDiagnosticsService
from app.ml.services.confidence_policy import evaluate_confidence
import re

def clean_ocr(text):
    if not isinstance(text, str): return ""
    text = re.sub(r'\bcompanynsel\b', 'counsel', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytention\b', 'contention', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytended\b', 'contended', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbermerit\b', 'no merit', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbercase\b', 'no case', text, flags=re.IGNORECASE)
    return text

class PredictionService:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join(os.path.dirname(__file__), "../artifacts/final_model")
        
        self.model_path = os.path.join(model_dir, "model.pkl")
        self.tfidf_path = os.path.join(model_dir, "tfidf.pkl")
        self.meta_path = os.path.join(model_dir, "final_model_metadata.json")
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.tfidf_path):
            raise FileNotFoundError("Model artifacts not found.")
            
        self.model = joblib.load(self.model_path)
        self.tfidf = joblib.load(self.tfidf_path)
        
        with open(self.meta_path, "r") as f:
            self.metadata = json.load(f)
            
        self.model_version = self.metadata.get("model_version", "ildc_clean_v1_final_baseline")
        self.diag_service = InputDiagnosticsService(tfidf_vectorizer=self.tfidf)

    def predict(self, text):
        # 2. Preprocess input
        cleaned_res = clean_document("live_input", text)
        cleaned_text = clean_ocr(cleaned_res['cleaned_text'])
        
        # Diagnostics
        diag = self.diag_service.analyze_input(cleaned_text)
        input_quality = diag.get("input_quality", "INSUFFICIENT_INFORMATION")
        rec_feat = diag.get("recognized_features", 0)
        
        # 3 & 4. Transform and predict_proba()
        X = self.tfidf.transform([cleaned_text])
        probs = self.model.predict_proba(X)[0]
        prob_0 = float(probs[0])
        prob_1 = float(probs[1])
        prediction_class = 1 if prob_1 >= 0.5 else 0
        
        prediction_data = {
            "prediction": prediction_class,
            "probability_class_1": prob_1,
            "probability_class_0": prob_0,
            "model_version": self.model_version
        }
        
        # 5. Apply frozen confidence policy
        conf = evaluate_confidence(prob_1)
        
        # 6. Apply input-quality safety overrides
        if input_quality == "INSUFFICIENT_INFORMATION" or rec_feat == 0:
            conf = {
                "band": "INSUFFICIENT_INPUT",
                "human_review_required": True
            }
            
        # 11. Return response
        return {
            "prediction": prediction_data,
            "confidence": conf,
            "input_diagnostics": diag
        }
