import os, glob, json, logging, numpy as np, pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
logging.basicConfig(level=logging.INFO)

def main():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    pipeline = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000)),
                         ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))])
    pipeline.fit(df_train['text'], df_train['label'])
    probs = pipeline.predict_proba(df_dev['text'])[:, 1]
    y_dev = df_dev['label'].values
    
    results = {}
    thresholds = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]
    for t in thresholds:
        preds = (probs >= t).astype(int)
        results[f"{t:.2f}"] = {
            "accuracy": float(accuracy_score(y_dev, preds)),
            "macro_f1": float(f1_score(y_dev, preds, average='macro')),
            "precision_class_0": float(precision_score(y_dev, preds, pos_label=0, zero_division=0)),
            "recall_class_0": float(recall_score(y_dev, preds, pos_label=0, zero_division=0)),
            "precision_class_1": float(precision_score(y_dev, preds, pos_label=1, zero_division=0)),
            "recall_class_1": float(recall_score(y_dev, preds, pos_label=1, zero_division=0)),
            "predicted_class_0": int(np.sum(preds == 0)),
            "predicted_class_1": int(np.sum(preds == 1)),
        }
    
    os.makedirs(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments", exist_ok=True)
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\threshold_analysis.json", "w") as f:
        json.dump(results, f, indent=4)
if __name__ == "__main__": main()
