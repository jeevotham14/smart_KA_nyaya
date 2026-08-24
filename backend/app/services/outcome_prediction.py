import os
import joblib
import numpy as np
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OutcomePredictor:
    def __init__(self):
        self.artifacts_dir = os.path.join(os.path.dirname(__file__), '../ml/artifacts')
        self.vectorizer_path = os.path.join(self.artifacts_dir, 'vectorizers/tfidf.pkl')
        self.model_path = os.path.join(self.artifacts_dir, 'models/best_calibrated_model.pkl')
        self.metadata_path = os.path.join(self.artifacts_dir, 'metrics/model_comparison_metadata.json')
        
        self.vectorizer = None
        self.model = None
        self.metadata = {}
        
        self.is_loaded = False
        self._load_artifacts()
        
    def _load_artifacts(self):
        try:
            if not os.path.exists(self.model_path) or not os.path.exists(self.vectorizer_path):
                logger.warning("ML artifacts not found. Outcome prediction will be unavailable.")
                return
                
            self.vectorizer = joblib.load(self.vectorizer_path)
            self.model = joblib.load(self.model_path)
            
            if os.path.exists(self.metadata_path):
                import json
                with open(self.metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                    
            self.is_loaded = True
            logger.info("Successfully loaded outcome prediction ML artifacts.")
        except Exception as e:
            logger.error(f"Failed to load ML artifacts: {e}")
            self.is_loaded = False
            
    def _get_explainability(self, text_vector) -> Dict[str, Any]:
        """Extracts which features influenced the specific prediction."""
        try:
            feature_names = self.vectorizer.get_feature_names_out()
            avg_coef = np.zeros(len(feature_names))
            
            # Extract average coefficients from CalibratedClassifierCV estimators
            for cc in self.model.calibrated_classifiers_:
                avg_coef += cc.estimator.coef_[0]
            avg_coef /= len(self.model.calibrated_classifiers_)
            
            vector_array = text_vector.toarray()[0]
            contributions = vector_array * avg_coef
            
            non_zero_idx = np.nonzero(vector_array)[0]
            active_contributions = [(feature_names[i], float(contributions[i])) for i in non_zero_idx]
            active_contributions.sort(key=lambda x: abs(x[1]), reverse=True)
            
            return {
                "top_influencing_features": active_contributions[:5],
                "disclaimer": "The model associated these textual features with this prediction based on historical ILDC data. These factors are statistical correlations and do NOT constitute legal reasoning."
            }
        except Exception as e:
            logger.error(f"Error generating explainability: {e}")
            return {"error": "Could not generate explainability."}

    def predict_outcome(self, text: str) -> Dict[str, Any]:
        """
        Executes the full inference pipeline for case outcome prediction.
        """
        if not self.is_loaded:
            return {
                "status": "error",
                "message": "Model artifacts are unavailable or incompatible. Please retrain the model."
            }
            
        # 1. Input Validation
        if not text or len(text.strip().split()) < 10:
            return {
                "status": "error",
                "message": "Input is insufficient. Please provide a detailed case description (at least 10 words)."
            }
            
        # 2. Compatible text preparation / Vectorization
        try:
            X = self.vectorizer.transform([text])
        except Exception as e:
            return {
                "status": "error",
                "message": f"Preprocessing failure: {e}"
            }
            
        # 3. Raw Prediction & Calibrated Probability
        try:
            prediction_label = int(self.model.predict(X)[0])
            probabilities = self.model.predict_proba(X)[0]
            calibrated_prob = float(probabilities[1]) # Probability of class 1 (Accepted)
            
            # Since calibrated_model wraps the base estimator, we get the decision function from the first fold
            # Just a rough proxy for raw score if needed, otherwise we can just use the prob
            raw_score = float(self.model.calibrated_classifiers_[0].estimator.decision_function(X)[0])
        except Exception as e:
            return {
                "status": "error",
                "message": f"Inference failure: {e}"
            }
            
        # 4. Uncertainty Checks (Human Review Triggers)
        human_review_reasons = []
        
        # Low calibrated certainty / Near decision boundary (e.g. between 40% and 60%)
        if 0.40 <= calibrated_prob <= 0.60:
            human_review_reasons.append("Prediction is near the decision boundary (low certainty).")
            
        # Input significantly different from training data (e.g. no known vocab matched)
        if X.nnz == 0:
            human_review_reasons.append("Input vocabulary is entirely foreign to the training data.")
            
        requires_human_review = len(human_review_reasons) > 0
        
        # 5. Explanation
        explanation = self._get_explainability(X)
        
        # 6. Final Result Formatting
        model_version = self.metadata.get("selected_model", "TF-IDF + LogisticRegression (Calibrated)")
        
        return {
            "task": "ildc_appeal_outcome_prediction",
            "prediction_label": prediction_label,
            "prediction_name": "AT_LEAST_ONE_PETITION_ACCEPTED" if prediction_label == 1 else "ALL_PETITIONS_REJECTED",
            "raw_score": raw_score,
            "calibrated_probability": calibrated_prob,
            "model_version": model_version,
            "requires_human_review": requires_human_review,
            "human_review_reasons": human_review_reasons,
            "explanation": explanation,
            "user_disclaimer": "[WARNING] This is a prediction based purely on statistical historical patterns in the ILDC appeal-outcome dataset. It is NOT a guaranteed court decision, NOT legal advice, and cannot determine if you will 'win' or 'lose' a real case."
        }

def get_outcome_predictor():
    return OutcomePredictor()
