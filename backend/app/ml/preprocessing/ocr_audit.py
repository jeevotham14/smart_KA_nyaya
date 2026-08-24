import os, glob, json, pandas as pd, numpy as np, re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

def clean_ocr(text):
    if not isinstance(text, str): return ""
    text = re.sub(r'\bcompanynsel\b', 'counsel', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytention\b', 'contention', text, flags=re.IGNORECASE)
    text = re.sub(r'\bcompanytended\b', 'contended', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbermerit\b', 'no merit', text, flags=re.IGNORECASE)
    text = re.sub(r'\bnumbercase\b', 'no case', text, flags=re.IGNORECASE)
    return text

def get_top_features(pipeline, n=10):
    vocab = pipeline.named_steps['tfidf'].get_feature_names_out()
    coef = pipeline.named_steps['clf'].coef_[0]
    top_0 = np.argsort(coef)[:n]
    top_1 = np.argsort(coef)[-n:][::-1]
    return {"class_0": [vocab[i] for i in top_0], "class_1": [vocab[i] for i in top_1]}

def main():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    # Count OCR artifacts
    def count_artifacts(df):
        return sum(df['text'].str.contains(r'\bcompanynsel\b|\bcompanytention\b|\bcompanytended\b|\bnumbermerit\b', case=False, regex=True))
    
    orig_artifacts = count_artifacts(df_train) + count_artifacts(df_dev)
    
    # Original
    pipe_orig = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000)),
                         ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))])
    pipe_orig.fit(df_train['text'], df_train['label'])
    preds_orig = pipe_orig.predict(df_dev['text'])
    acc_orig = accuracy_score(df_dev['label'], preds_orig)
    f1_orig = f1_score(df_dev['label'], preds_orig, average='macro')
    feat_orig = get_top_features(pipe_orig)
    
    # Normalized
    df_train_norm = df_train.copy()
    df_dev_norm = df_dev.copy()
    df_train_norm['text'] = df_train_norm['text'].apply(clean_ocr)
    df_dev_norm['text'] = df_dev_norm['text'].apply(clean_ocr)
    
    pipe_norm = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000)),
                         ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))])
    pipe_norm.fit(df_train_norm['text'], df_train_norm['label'])
    preds_norm = pipe_norm.predict(df_dev_norm['text'])
    acc_norm = accuracy_score(df_dev_norm['label'], preds_norm)
    f1_norm = f1_score(df_dev_norm['label'], preds_norm, average='macro')
    feat_norm = get_top_features(pipe_norm)
    
    res = {
        "ocr_frequencies": {
            "detected_artifacts_in_corpus": int(orig_artifacts)
        },
        "performance_comparison": {
            "ORIGINAL": {"accuracy": float(acc_orig), "macro_f1": float(f1_orig)},
            "NORMALIZED": {"accuracy": float(acc_norm), "macro_f1": float(f1_norm)},
            "DIFFERENCE": {"accuracy": float(acc_norm - acc_orig), "macro_f1": float(f1_norm - f1_orig)}
        },
        "top_features": {
            "ORIGINAL": feat_orig,
            "NORMALIZED": feat_norm
        }
    }
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\ocr_audit.json", "w") as f:
        json.dump(res, f, indent=4)
        
if __name__ == "__main__": main()
