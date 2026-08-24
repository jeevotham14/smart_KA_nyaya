import os
import glob
import json
import logging
import pandas as pd
import numpy as np
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_experiment():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    
    # 1. VERIFY DATA
    df_train_list = [pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))]
    df_train = pd.concat(df_train_list, ignore_index=True)
    
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    train_dist = df_train['label'].value_counts()
    dev_dist = df_dev['label'].value_counts()
    
    majority_class_dev = dev_dist.idxmax()
    baseline_acc = dev_dist.max() / len(df_dev)
    
    dup_ids = set(df_train['id']).intersection(set(df_dev['id']))
    mask_token_train = df_train['text'].str.contains(r"\[MASKED_OUTCOME\]", regex=True).sum()
    mask_token_dev = df_dev['text'].str.contains(r"\[MASKED_OUTCOME\]", regex=True).sum()
    
    verification_report = {
        "train_size": len(df_train),
        "dev_size": len(df_dev),
        "train_dist": {"0": int(train_dist[0]), "1": int(train_dist[1]), "0_pct": float(train_dist[0]/len(df_train)*100), "1_pct": float(train_dist[1]/len(df_train)*100)},
        "dev_dist": {"0": int(dev_dist[0]), "1": int(dev_dist[1]), "0_pct": float(dev_dist[0]/len(df_dev)*100), "1_pct": float(dev_dist[1]/len(df_dev)*100)},
        "majority_class_baseline_acc": float(baseline_acc),
        "duplicate_ids_between_splits": len(dup_ids),
        "mask_tokens_found": int(mask_token_train + mask_token_dev)
    }
    
    # 2. EXPERIMENT PROTOCOL
    grid = [
        {"model": "LogisticRegression", "class_weight": None, "ngram_range": (1, 1), "max_features": 5000},
        {"model": "LogisticRegression", "class_weight": "balanced", "ngram_range": (1, 1), "max_features": 5000},
        {"model": "LogisticRegression", "class_weight": "balanced", "ngram_range": (1, 2), "max_features": 10000},
        {"model": "LinearSVC", "class_weight": None, "ngram_range": (1, 1), "max_features": 5000},
        {"model": "LinearSVC", "class_weight": "balanced", "ngram_range": (1, 1), "max_features": 5000}
    ]
    
    results = []
    
    best_f1 = 0
    best_config = None
    best_model = None
    best_vec = None
    best_preds = None
    
    y_train = df_train['label'].values
    y_dev = df_dev['label'].values
    
    # 3-6. TRAIN MULTIPLE BASELINES & PREVENT LEAKAGE
    for i, conf in enumerate(grid):
        logger.info(f"Running Exp {i+1}: {conf}")
        vec = TfidfVectorizer(ngram_range=conf['ngram_range'], max_features=conf['max_features'], stop_words='english')
        
        # FIT ONLY ON TRAIN
        X_train = vec.fit_transform(df_train['text'])
        # TRANSFORM DEV
        X_dev = vec.transform(df_dev['text'])
        
        if conf['model'] == "LogisticRegression":
            clf = LogisticRegression(class_weight=conf['class_weight'], max_iter=1000, random_state=42)
        else:
            clf = LinearSVC(class_weight=conf['class_weight'], max_iter=2000, dual=False, random_state=42)
            
        clf.fit(X_train, y_train)
        preds = clf.predict(X_dev)
        
        mac_f1 = f1_score(y_dev, preds, average='macro')
        acc = accuracy_score(y_dev, preds)
        
        res = {
            "config": conf,
            "accuracy": float(acc),
            "macro_f1": float(mac_f1),
            "weighted_f1": float(f1_score(y_dev, preds, average='weighted')),
            "precision": float(precision_score(y_dev, preds, average='macro')),
            "recall": float(recall_score(y_dev, preds, average='macro')),
            "classification_report": classification_report(y_dev, preds, output_dict=True)
        }
        results.append(res)
        
        if mac_f1 > best_f1:
            best_f1 = mac_f1
            best_config = res
            best_model = clf
            best_vec = vec
            best_preds = preds
            
    # 8. CHECK FOR SHORTCUT LEARNING
    feature_names = best_vec.get_feature_names_out()
    coefs = best_model.coef_[0]
    
    top_pos_idx = np.argsort(coefs)[-20:]
    top_neg_idx = np.argsort(coefs)[:20]
    
    top_features = {
        "pushing_to_1_accepted": [(feature_names[i], float(coefs[i])) for i in reversed(top_pos_idx)],
        "pushing_to_0_rejected": [(feature_names[i], float(coefs[i])) for i in top_neg_idx]
    }
    
    # 7. ERROR ANALYSIS
    df_dev['preds'] = best_preds
    fp = df_dev[(df_dev['label'] == 0) & (df_dev['preds'] == 1)]
    fn = df_dev[(df_dev['label'] == 1) & (df_dev['preds'] == 0)]
    tp = df_dev[(df_dev['label'] == 1) & (df_dev['preds'] == 1)]
    tn = df_dev[(df_dev['label'] == 0) & (df_dev['preds'] == 0)]
    
    def get_sample(df_sub):
        if len(df_sub) == 0: return []
        idx = random.choice(df_sub.index)
        return {"id": df_sub.loc[idx, 'id'], "excerpt": df_sub.loc[idx, 'text'][:400] + "..."}
        
    errors = {
        "false_positives": [get_sample(fp) for _ in range(2)],
        "false_negatives": [get_sample(fn) for _ in range(2)],
        "true_positives": [get_sample(tp)],
        "true_negatives": [get_sample(tn)]
    }
    
    output = {
        "verification": verification_report,
        "experiments": results,
        "best_model": best_config,
        "top_features": top_features,
        "error_analysis": errors,
        "confusion_matrix": confusion_matrix(y_dev, best_preds).tolist()
    }
    
    os.makedirs(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments", exist_ok=True)
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\baseline_comparison.json", 'w') as f:
        json.dump(output, f, indent=4)
        
    print("Baseline training complete. Artifacts saved.")

if __name__ == '__main__':
    run_experiment()
