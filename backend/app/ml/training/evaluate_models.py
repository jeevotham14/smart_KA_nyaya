import os
import time
import json
import joblib
import logging
import numpy as np
from sys import getsizeof
from app.ml.data.load_ildc import load_ildc_data
from app.ml.evaluation.evaluate import evaluate_model
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_and_evaluate(name, model_class, kwargs, X_train, y_train, X_dev, y_dev):
    logger.info(f"Training {name}...")
    model = model_class(**kwargs)
    
    start_train = time.time()
    model.fit(X_train, y_train)
    train_time = time.time() - start_train
    
    start_infer = time.time()
    y_pred = model.predict(X_dev)
    infer_time = time.time() - start_infer
    
    # We use a dummy model size estimate (joblib serialization size)
    temp_file = "temp_model.pkl"
    joblib.dump(model, temp_file)
    model_size = os.path.getsize(temp_file)
    os.remove(temp_file)
    
    metrics, _, _ = evaluate_model(model, X_dev, y_dev)
    
    # Brier Score (Raw)
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_dev)[:, 1]
    elif hasattr(model, "decision_function"):
        # For SVC, raw decision function isn't a probability, we skip raw brier
        probs = None
    else:
        probs = None
        
    raw_brier = brier_score_loss(y_dev, probs) if probs is not None else None
    
    logger.info(f"Calibrating {name}...")
    calibrated_model = CalibratedClassifierCV(model, method='sigmoid', cv=5)
    calibrated_model.fit(X_train, y_train) # Fitting calibration on Dev split is common if no calibration split exists, but ideally train on subset of train. For baseline, prefit is fine.
    
    calib_probs = calibrated_model.predict_proba(X_dev)[:, 1]
    calib_brier = brier_score_loss(y_dev, calib_probs)
    
    return {
        "name": name,
        "model_obj": model,
        "calibrated_model_obj": calibrated_model,
        "train_time": train_time,
        "infer_time": infer_time,
        "model_size_bytes": model_size,
        "metrics": metrics,
        "raw_brier": raw_brier,
        "calib_brier": calib_brier
    }

def run_model_comparison():
    df_train, df_dev, df_test = load_ildc_data(sample_size=1500)
    
    logger.info("Vectorizing...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', max_df=0.9, min_df=5)
    X_train = vectorizer.fit_transform(df_train['text'])
    y_train = df_train['label']
    
    X_dev = vectorizer.transform(df_dev['text'])
    y_dev = df_dev['label']
    
    results = []
    
    # 1. Logistic Regression
    lr_res = train_and_evaluate(
        "LogisticRegression", 
        LogisticRegression, 
        {"class_weight": "balanced", "random_state": 42, "max_iter": 1000},
        X_train, y_train, X_dev, y_dev
    )
    results.append(lr_res)
    
    # 2. Linear SVM
    svm_res = train_and_evaluate(
        "LinearSVC", 
        LinearSVC, 
        {"class_weight": "balanced", "random_state": 42, "max_iter": 2000, "dual": False},
        X_train, y_train, X_dev, y_dev
    )
    results.append(svm_res)
    
    # Compare and Select
    best_model_res = max(results, key=lambda x: x["metrics"]["macro_f1"])
    
    logger.info(f"Selected Model: {best_model_res['name']}")
    
    # Save artifacts
    artifacts_dir = os.path.join(os.path.dirname(__file__), '../artifacts')
    joblib.dump(best_model_res['calibrated_model_obj'], os.path.join(artifacts_dir, 'models/best_calibrated_model.pkl'))
    joblib.dump(vectorizer, os.path.join(artifacts_dir, 'vectorizers/tfidf.pkl'))
    
    metadata = {
        "selected_model": best_model_res['name'],
        "all_results": [
            {
                "name": r["name"],
                "train_time": r["train_time"],
                "infer_time": r["infer_time"],
                "model_size_bytes": r["model_size_bytes"],
                "macro_f1": r["metrics"]["macro_f1"],
                "raw_brier_score": r["raw_brier"],
                "calibrated_brier_score": r["calib_brier"]
            } for r in results
        ],
        "final_metrics": best_model_res["metrics"]
    }
    
    with open(os.path.join(artifacts_dir, 'metrics/model_comparison_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print("\\n--- MODEL COMPARISON RESULTS ---")
    print(json.dumps(metadata, indent=2))

if __name__ == '__main__':
    run_model_comparison()
