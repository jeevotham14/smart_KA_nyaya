import os
import glob
import json
import logging
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, brier_score_loss, log_loss

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ece_score(y_true, y_prob, n_bins=10):
    bins = np.linspace(0., 1., n_bins + 1)
    binids = np.digitize(y_prob, bins) - 1
    
    ece = 0.0
    for i in range(n_bins):
        mask = binids == i
        if np.any(mask):
            prob_true = np.mean(y_true[mask])
            prob_pred = np.mean(y_prob[mask])
            ece += (np.sum(mask) / len(y_prob)) * np.abs(prob_true - prob_pred)
    return float(ece)

def run_calibration():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    
    df_train_list = [pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))]
    df_train = pd.concat(df_train_list, ignore_index=True)
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    X_train = df_train['text']
    y_train = df_train['label'].values
    X_dev = df_dev['text']
    y_dev = df_dev['label'].values
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000, stop_words='english')),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))
    ])
    
    logger.info("Training uncalibrated baseline pipeline...")
    pipeline.fit(X_train, y_train)
    uncalibrated_probs = pipeline.predict_proba(X_dev)[:, 1]
    uncalibrated_preds = pipeline.predict(X_dev)
    
    logger.info("Training calibrated pipeline (CV=5 on TRAIN)...")
    calibrated_pipeline = CalibratedClassifierCV(estimator=pipeline, method='sigmoid', cv=5, n_jobs=-1)
    calibrated_pipeline.fit(X_train, y_train)
    
    calibrated_probs = calibrated_pipeline.predict_proba(X_dev)[:, 1]
    calibrated_preds = calibrated_pipeline.predict(X_dev)
    
    def eval_model(preds, probs):
        return {
            "accuracy": float(accuracy_score(y_dev, preds)),
            "macro_f1": float(f1_score(y_dev, preds, average='macro')),
            "brier_score": float(brier_score_loss(y_dev, probs)),
            "log_loss": float(log_loss(y_dev, probs)),
            "ece": float(ece_score(y_dev, probs)),
            "per_class_precision": precision_score(y_dev, preds, average=None).tolist(),
            "per_class_recall": recall_score(y_dev, preds, average=None).tolist(),
            "per_class_f1": f1_score(y_dev, preds, average=None).tolist()
        }
        
    res_uncalib = eval_model(uncalibrated_preds, uncalibrated_probs)
    res_calib = eval_model(calibrated_preds, calibrated_probs)
    
    results = {
        "UNCALIBRATED": res_uncalib,
        "CALIBRATED": res_calib
    }
    
    os.makedirs(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments", exist_ok=True)
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\calibration_results.json", 'w') as f:
        json.dump(results, f, indent=4)
        
    def get_reliability_bins(probs):
        bins = np.linspace(0, 1.0, 11)
        binids = np.digitize(probs, bins) - 1
        bin_stats = []
        for i in range(10):
            mask = binids == i
            count = np.sum(mask)
            avg_prob = float(np.mean(probs[mask])) if count > 0 else 0.0
            actual_frac = float(np.mean(y_dev[mask])) if count > 0 else 0.0
            bin_stats.append({
                "bin_range": f"{bins[i]:.1f}-{bins[i+1]:.1f}",
                "count": int(count),
                "avg_prob": avg_prob,
                "actual_fraction_label_1": actual_frac
            })
        return bin_stats
        
    rel_bins_uncalib = get_reliability_bins(uncalibrated_probs)
    rel_bins_calib = get_reliability_bins(calibrated_probs)
    
    def get_boundary_analysis(probs):
        ranges = [(0.0, 0.1), (0.1, 0.2), (0.2, 0.3), (0.3, 0.4), (0.4, 0.6), (0.6, 0.7), (0.7, 0.8), (0.8, 0.9), (0.9, 1.0)]
        analysis = []
        for r_min, r_max in ranges:
            mask = (probs >= r_min) & (probs <= r_max)
            count = np.sum(mask)
            if count == 0:
                acc, f1 = 0.0, 0.0
                dist = {"0": 0, "1": 0}
            else:
                y_sub = y_dev[mask]
                preds_sub = (probs[mask] >= 0.5).astype(int)
                acc = float(accuracy_score(y_sub, preds_sub))
                f1 = float(f1_score(y_sub, preds_sub, average='macro')) if len(np.unique(y_sub)) > 1 else float(f1_score(y_sub, preds_sub, average='macro', zero_division=0))
                dist = {"0": int(np.sum(y_sub == 0)), "1": int(np.sum(y_sub == 1))}
            analysis.append({
                "range": f"{r_min:.2f}-{r_max:.2f}",
                "count": int(count),
                "accuracy": acc,
                "macro_f1": f1,
                "actual_distribution": dist
            })
        return analysis
        
    bound_uncalib = get_boundary_analysis(uncalibrated_probs)
    bound_calib = get_boundary_analysis(calibrated_probs)
    
    rel_out = {
        "reliability_bins": {
            "UNCALIBRATED": rel_bins_uncalib,
            "CALIBRATED": rel_bins_calib
        },
        "decision_boundary_analysis": {
            "UNCALIBRATED": bound_uncalib,
            "CALIBRATED": bound_calib
        }
    }
    
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\reliability_analysis.json", 'w') as f:
        json.dump(rel_out, f, indent=4)
        
    logger.info("Calibration evaluation complete.")

if __name__ == '__main__':
    run_calibration()
