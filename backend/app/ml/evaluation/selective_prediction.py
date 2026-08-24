import os, glob, json, pandas as pd, numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

def main():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    pipeline = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000)),
                         ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))])
    pipeline.fit(df_train['text'], df_train['label'])
    probs = pipeline.predict_proba(df_dev['text'])[:, 1]
    y_dev = df_dev['label'].values
    total = len(y_dev)

    policies = {
        "A": {"low": 0.30, "high": 0.70},
        "B": {"low": 0.25, "high": 0.75},
        "C": {"low": 0.20, "high": 0.80}
    }
    
    results = {}
    for pol, bounds in policies.items():
        mask_auto = (probs <= bounds["low"]) | (probs >= bounds["high"])
        mask_human = ~mask_auto
        
        n_auto = int(np.sum(mask_auto))
        n_human = int(np.sum(mask_human))
        
        if n_auto > 0:
            acc_auto = float(accuracy_score(y_dev[mask_auto], (probs[mask_auto] >= 0.5).astype(int)))
            f1_auto = float(f1_score(y_dev[mask_auto], (probs[mask_auto] >= 0.5).astype(int), average='macro'))
        else:
            acc_auto, f1_auto = 0.0, 0.0
            
        if n_human > 0:
            acc_human = float(accuracy_score(y_dev[mask_human], (probs[mask_human] >= 0.5).astype(int)))
        else:
            acc_human = 0.0
            
        results[f"Policy_{pol}"] = {
            "bounds": bounds,
            "auto_classified_count": n_auto,
            "auto_classified_percentage": float(n_auto / total * 100),
            "auto_accuracy": acc_auto,
            "auto_macro_f1": f1_auto,
            "human_review_count": n_human,
            "human_review_percentage": float(n_human / total * 100),
            "human_review_accuracy_if_forced": acc_human,
            "LOW_SAMPLE_WARNING_AUTO": bool(n_auto < 30),
            "LOW_SAMPLE_WARNING_HUMAN": bool(n_human < 30)
        }
        
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\selective_prediction.json", "w") as f:
        json.dump(results, f, indent=4)
if __name__ == "__main__": main()
