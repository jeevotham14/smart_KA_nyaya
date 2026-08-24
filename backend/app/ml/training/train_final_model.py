import os
import glob
import json
import joblib
import pandas as pd
import re
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def clean_ocr(text):
    if not isinstance(text, str): return ""
    text = re.sub(r'\bcompanynsel\b', 'counsel', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytention\b', 'contention', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytended\b', 'contended', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbermerit\b', 'no merit', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbercase\b', 'no case', text, flags=re.IGNORECASE)
    return text

def main():
    print("Loading cleaned train dataset...")
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    train_files = glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))
    df_train = pd.concat([pd.read_parquet(f) for f in train_files]).reset_index(drop=True)
    
    print(f"Applying OCR normalization to {len(df_train)} rows...")
    df_train['text'] = df_train['text'].apply(clean_ocr)
    
    print("Fitting TF-IDF...")
    tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=10000)
    X_train = tfidf.fit_transform(df_train['text'])
    y_train = df_train['label']
    
    print("Fitting Logistic Regression...")
    clf = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)
    
    out_dir = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\final_model"
    os.makedirs(out_dir, exist_ok=True)
    
    print("Saving model artifacts...")
    joblib.dump(clf, os.path.join(out_dir, "model.pkl"))
    joblib.dump(tfidf, os.path.join(out_dir, "tfidf.pkl"))
    
    label_dist = df_train['label'].value_counts().to_dict()
    
    metadata = {
        "model_version": "ildc_clean_v1_final_baseline",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "dataset": "REAL_ILDC_MULTI",
        "preprocessing": "clean_v1",
        "ocr_normalization": True,
        "calibration": False,
        "test_seen_during_training": False,
        "test_seen_during_model_selection": False,
        "ngram_range": [1, 2],
        "max_features": 10000,
        "class_weight": "balanced",
        "human_review_lower_threshold": 0.30,
        "human_review_upper_threshold": 0.70,
        "training_row_count": int(len(df_train)),
        "training_label_distribution": {str(k): int(v) for k, v in label_dist.items()},
        "tfidf_vocabulary_size": len(tfidf.vocabulary_),
        "model_parameters": clf.get_params(),
        "cleaner_version": "1.0-conservative"
    }
    
    with open(os.path.join(out_dir, "final_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("DONE!")

if __name__ == "__main__":
    main()
