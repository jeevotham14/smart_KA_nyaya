import os
import glob
import json
import logging
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_diagnostics():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    parquet_files = glob.glob(os.path.join(folder, "*_clean_v1.parquet"))
    
    if not parquet_files:
        logger.error("No processed parquets found!")
        return
        
    dfs = []
    for f in parquet_files:
        dfs.append(pd.read_parquet(f))
        
    df = pd.concat(dfs, ignore_index=True)
    df_train = df[df['split'] == 'train'].copy()
    df_dev = df[df['split'] == 'dev'].copy()
    
    # PART 5: CLEANER ACTION BY LABEL
    action_by_label = pd.crosstab(df['label'], df['cleaner_action'], normalize='index') * 100
    print("\n--- PART 5: CLEANER ACTION BY LABEL (%) ---")
    print(action_by_label)
    
    # PART 6: DIAGNOSTIC EXPERIMENTS
    print("\n--- PART 6: DIAGNOSTIC EXPERIMENTS ---")
    
    def eval_model(name, X_tr, X_te, y_tr, y_te):
        if X_tr.shape[1] == 0:
            print(f"Skipping {name}, 0 features.")
            return
        clf = LogisticRegression(class_weight='balanced', max_iter=1000)
        clf.fit(X_tr, y_tr)
        preds = clf.predict(X_te)
        print(f"\nExperiment: {name}")
        print(f"Accuracy:  {accuracy_score(y_te, preds):.4f}")
        print(f"Macro F1:  {f1_score(y_te, preds, average='macro'):.4f}")
        
    y_train = df_train['label']
    y_dev = df_dev['label']
    
    # Baseline
    majority_class = y_dev.mode()[0]
    baseline_acc = accuracy_score(y_dev, [majority_class]*len(y_dev))
    print(f"\nMajority Class Accuracy Baseline: {baseline_acc:.4f}")
    
    # Exp A: Explicit outcome pattern features
    vec_a = TfidfVectorizer(vocabulary=["allowed", "dismissed", "set", "aside", "rejected", "accepted"])
    Xa_train = vec_a.fit_transform(df_train['text'])
    Xa_dev = vec_a.transform(df_dev['text'])
    eval_model("A - Explicit Keywords Only", Xa_train, Xa_dev, y_train, y_dev)
    
    # Exp B: Final 10% of cleaned documents
    def get_last_10(txt):
        words = txt.split()
        return " ".join(words[-max(1, len(words)//10):])
    
    vec_b = TfidfVectorizer(max_features=2000)
    Xb_train = vec_b.fit_transform(df_train['text'].apply(get_last_10))
    Xb_dev = vec_b.transform(df_dev['text'].apply(get_last_10))
    eval_model("B - Final 10% of Cleaned Text", Xb_train, Xb_dev, y_train, y_dev)
    
    # Exp C: Cleaner Metadata Only
    Xc_train = pd.get_dummies(df_train['cleaner_action']).values
    Xc_dev = pd.get_dummies(df_dev['cleaner_action']).values
    eval_model("C - Cleaner Metadata (Truncated/Masked/None)", Xc_train, Xc_dev, y_train, y_dev)
    
    # Exp D: Full Cleaned Text
    vec_d = TfidfVectorizer(max_features=5000, max_df=0.9, min_df=5)
    Xd_train = vec_d.fit_transform(df_train['text'])
    Xd_dev = vec_d.transform(df_dev['text'])
    eval_model("D - Full Cleaned Text (Baseline TF-IDF)", Xd_train, Xd_dev, y_train, y_dev)

if __name__ == '__main__':
    run_diagnostics()
