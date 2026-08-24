import os
import glob
import json
import logging
import pandas as pd
import numpy as np
import random
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from app.ml.preprocessing.suspicious_features import get_ablation_regex, CATEGORY_A, CATEGORY_B, CATEGORY_C

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_ablation():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    
    # Load FULL (Cleaned v1)
    df_train_list = [pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))]
    df_train_full = pd.concat(df_train_list, ignore_index=True)
    df_dev_full = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    y_train = df_train_full['label'].values
    y_dev = df_dev_full['label'].values

    experiments = {
        "FULL": None,
        "ABLATION_1": ['A'],
        "ABLATION_2": ['A', 'B'],
        "ABLATION_3": ['A', 'B', 'C']
    }

    results = {}
    
    def train_and_eval(name, X_train_texts, X_dev_texts):
        logger.info(f"Running {name}...")
        vec = TfidfVectorizer(ngram_range=(1,2), max_features=10000, stop_words='english')
        X_tr = vec.fit_transform(X_train_texts)
        X_te = vec.transform(X_dev_texts)
        
        clf = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
        clf.fit(X_tr, y_train)
        preds = clf.predict(X_te)
        
        mac_f1 = f1_score(y_dev, preds, average='macro')
        acc = accuracy_score(y_dev, preds)
        
        feature_names = vec.get_feature_names_out()
        coefs = clf.coef_[0]
        top_pos_idx = np.argsort(coefs)[-20:]
        top_neg_idx = np.argsort(coefs)[:20]
        
        top_features = {
            "pushing_to_1_accepted": [(feature_names[i], float(coefs[i])) for i in reversed(top_pos_idx)],
            "pushing_to_0_rejected": [(feature_names[i], float(coefs[i])) for i in top_neg_idx]
        }
        
        return {
            "accuracy": float(acc),
            "macro_f1": float(mac_f1),
            "weighted_f1": float(f1_score(y_dev, preds, average='weighted')),
            "per_class_precision": precision_score(y_dev, preds, average=None).tolist(),
            "per_class_recall": recall_score(y_dev, preds, average=None).tolist(),
            "per_class_f1": f1_score(y_dev, preds, average=None).tolist(),
            "confusion_matrix": confusion_matrix(y_dev, preds).tolist(),
            "top_features": top_features
        }

    for exp_name, cats in experiments.items():
        if cats is None:
            train_texts = df_train_full['text']
            dev_texts = df_dev_full['text']
        else:
            regex = get_ablation_regex(cats)
            train_texts = df_train_full['text'].str.replace(regex, ' ', regex=True)
            dev_texts = df_dev_full['text'].str.replace(regex, ' ', regex=True)
            
        results[exp_name] = train_and_eval(exp_name, train_texts, dev_texts)

    # Calculate drops
    full_f1 = results['FULL']['macro_f1']
    drops = {}
    for exp_name in ['ABLATION_1', 'ABLATION_2', 'ABLATION_3']:
        exp_f1 = results[exp_name]['macro_f1']
        abs_change = exp_f1 - full_f1
        rel_change = (abs_change / full_f1) * 100
        drops[exp_name] = {
            "absolute_change": float(abs_change),
            "relative_change_pct": float(rel_change)
        }

    output = {
        "experiments": results,
        "performance_changes": drops
    }
    
    os.makedirs(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments", exist_ok=True)
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\feature_ablation_results.json", 'w') as f:
        json.dump(output, f, indent=4)
        
    # PART 7: SAMPLING FOR SHORTCUT AUDIT
    random.seed(42)
    audit = {}
    
    def sample_category(cat_patterns, name, n=20):
        regex = re.compile(r'\b(' + '|'.join(cat_patterns) + r')\b', re.IGNORECASE)
        matches = []
        for idx, row in df_dev_full.iterrows():
            text = row['text']
            for m in regex.finditer(text):
                start = max(0, m.start() - 60)
                end = min(len(text), m.end() + 60)
                matches.append(text[start:end])
        
        sampled = random.sample(matches, min(n, len(matches)))
        audit[name] = sampled

    sample_category(CATEGORY_A, "CATEGORY_A")
    sample_category(CATEGORY_B, "CATEGORY_B")
    sample_category(CATEGORY_C, "CATEGORY_C")
    
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\shortcut_audit.json", 'w') as f:
        json.dump(audit, f, indent=4)
        
    logger.info("Feature ablation complete.")

if __name__ == '__main__':
    run_ablation()
