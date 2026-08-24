import os
import json
import joblib
import logging
import numpy as np
from app.ml.data.load_ildc import load_ildc_data
from app.ml.evaluation.evaluate import evaluate_model
from sklearn.metrics import brier_score_loss

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def evaluate_and_explain():
    logger.info("Loading test split...")
    _, _, df_test = load_ildc_data(sample_size=1500)
    
    artifacts_dir = os.path.join(os.path.dirname(__file__), '../artifacts')
    
    logger.info("Loading artifacts...")
    vectorizer = joblib.load(os.path.join(artifacts_dir, 'vectorizers/tfidf.pkl'))
    calibrated_model = joblib.load(os.path.join(artifacts_dir, 'models/best_calibrated_model.pkl'))
    
    X_test = vectorizer.transform(df_test['text'])
    y_test = df_test['label']
    
    logger.info("Evaluating on Test Split...")
    metrics, conf_matrix, majority_acc = evaluate_model(calibrated_model, X_test, y_test)
    
    probs = calibrated_model.predict_proba(X_test)[:, 1]
    brier = brier_score_loss(y_test, probs)
    
    final_metrics = {
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "macro_f1": metrics["macro_f1"],
        "weighted_f1": metrics["weighted_f1"],
        "brier_score": brier,
        "majority_class_accuracy": majority_acc,
        "confusion_matrix": conf_matrix,
        "classification_report": metrics["classification_report"]
    }
    
    with open(os.path.join(artifacts_dir, 'metrics/final_test_metrics.json'), 'w') as f:
        json.dump(final_metrics, f, indent=4)
        
    logger.info("Saved final test metrics.")
    
    # EXPLAINABILITY (TF-IDF + Linear Model)
    # CalibratedClassifierCV has `.calibrated_classifiers_`
    # Each has `.estimator` which is the LogisticRegression
    # We average the coefficients across all CV folds
    
    feature_names = vectorizer.get_feature_names_out()
    
    # Average coefficients
    avg_coef = np.zeros(len(feature_names))
    for cc in calibrated_model.calibrated_classifiers_:
        avg_coef += cc.estimator.coef_[0]
    avg_coef /= len(calibrated_model.calibrated_classifiers_)
    
    # Top features globally
    top_pos_idx = np.argsort(avg_coef)[-10:] # Contributes to 1
    top_neg_idx = np.argsort(avg_coef)[:10]  # Contributes to 0
    
    global_explanations = {
        "top_features_for_class_1_accepted": [(feature_names[i], float(avg_coef[i])) for i in reversed(top_pos_idx)],
        "top_features_for_class_0_rejected": [(feature_names[i], float(avg_coef[i])) for i in top_neg_idx]
    }
    
    # Explain one specific prediction
    sample_idx = 0
    sample_text = df_test.iloc[sample_idx]['text']
    sample_label = df_test.iloc[sample_idx]['label']
    sample_pred = calibrated_model.predict(X_test[sample_idx])[0]
    
    # Multiply term frequency by average coefficient to get specific contribution
    sample_vector = X_test[sample_idx].toarray()[0]
    contributions = sample_vector * avg_coef
    
    # Get top contributing words for this specific prediction
    non_zero_idx = np.nonzero(sample_vector)[0]
    active_contributions = [(feature_names[i], float(contributions[i])) for i in non_zero_idx]
    
    # Sort by absolute impact
    active_contributions.sort(key=lambda x: abs(x[1]), reverse=True)
    
    explanation = {
        "global_feature_importance": global_explanations,
        "specific_prediction_explanation": {
            "true_label": int(sample_label),
            "predicted_label": int(sample_pred),
            "top_influencing_features": active_contributions[:10],
            "disclaimer": "The model associated these textual features with this prediction. These factors did NOT necessarily cause the court to make this decision."
        }
    }
    
    with open(os.path.join(artifacts_dir, 'metrics/explainability_report.json'), 'w') as f:
        json.dump(explanation, f, indent=4)
        
    print("\\n--- FINAL EVALUATION COMPLETE ---")
    print("Test Accuracy:", metrics["accuracy"])
    print("Test Macro F1:", metrics["macro_f1"])

if __name__ == '__main__':
    evaluate_and_explain()
