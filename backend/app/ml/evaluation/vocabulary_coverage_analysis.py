import os, glob, json, pandas as pd, numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

def run_experiment():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=10000)
    X_train = tfidf.fit_transform(df_train['text'])
    y_train = df_train['label']
    
    clf = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)

    X_dev = tfidf.transform(df_dev['text'])
    y_dev = df_dev['label'].values
    preds = clf.predict(X_dev)
    probs = clf.predict_proba(X_dev)

    non_zero = X_dev.getnnz(axis=1)
    tokens_len = np.array([len(str(t).split()) for t in df_dev['text']])
    coverage = non_zero / (tokens_len + 1e-9)

    groups = [
        ("0-5%", lambda c: c <= 0.05),
        ("5-10%", lambda c: 0.05 < c <= 0.10),
        ("10-20%", lambda c: 0.10 < c <= 0.20),
        ("20-40%", lambda c: 0.20 < c <= 0.40),
        ("40%+", lambda c: c > 0.40),
    ]

    results = {}
    for name, condition in groups:
        mask = condition(coverage)
        count = int(np.sum(mask))
        if count == 0:
            results[name] = {"count": 0}
            continue
            
        y_true_g = y_dev[mask]
        preds_g = preds[mask]
        probs_g = np.max(probs[mask], axis=1)
        
        acc = accuracy_score(y_true_g, preds_g)
        f1 = f1_score(y_true_g, preds_g, average='macro') if len(np.unique(y_true_g)) > 1 else None
        
        class_dist = {str(k): int(v) for k, v in zip(*np.unique(y_true_g, return_counts=True))}
        
        results[name] = {
            "count": count,
            "accuracy": acc,
            "macro_f1": f1,
            "average_probability": float(np.mean(probs_g)),
            "class_distribution": class_dist,
            "LOW_SAMPLE_WARNING": count < 30
        }

    out_file = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\vocabulary_coverage.json"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w") as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    run_experiment()
