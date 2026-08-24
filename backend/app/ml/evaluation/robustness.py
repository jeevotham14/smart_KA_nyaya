import os, glob, json, pandas as pd, numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, f1_score

def main():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    # Stability Test
    seeds = [42, 100, 2023, 777, 999]
    acc_list, f1_list = [], []
    
    for seed in seeds:
        pipeline = Pipeline([('tfidf', TfidfVectorizer(ngram_range=(1,2), max_features=10000)),
                             ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=seed))])
        pipeline.fit(df_train['text'], df_train['label'])
        preds = pipeline.predict(df_dev['text'])
        acc_list.append(accuracy_score(df_dev['label'], preds))
        f1_list.append(f1_score(df_dev['label'], preds, average='macro'))
        
    stability = {
        "mean_accuracy": float(np.mean(acc_list)),
        "std_accuracy": float(np.std(acc_list)),
        "mean_macro_f1": float(np.mean(f1_list)),
        "std_macro_f1": float(np.std(f1_list)),
        "min_macro_f1": float(np.min(f1_list)),
        "max_macro_f1": float(np.max(f1_list))
    }
    
    # Input Quality Diagnostics
    tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=10000)
    tfidf.fit(df_train['text'])
    
    def calc_diagnostics(texts):
        tokens = [len(str(t).split()) for t in texts]
        X = tfidf.transform(texts)
        non_zero = X.getnnz(axis=1)
        coverage = np.array(non_zero) / (np.array(tokens) + 1e-9)
        return np.array(tokens), non_zero, coverage
        
    train_tokens, train_nz, train_cov = calc_diagnostics(df_train['text'])
    dev_tokens, dev_nz, dev_cov = calc_diagnostics(df_dev['text'])
    
    diagnostics = {
        "TRAIN": {
            "token_count": {"1st_pct": float(np.percentile(train_tokens, 1)), "50th_pct": float(np.percentile(train_tokens, 50)), "99th_pct": float(np.percentile(train_tokens, 99))},
            "vocab_coverage": {"1st_pct": float(np.percentile(train_cov, 1)), "50th_pct": float(np.percentile(train_cov, 50)), "99th_pct": float(np.percentile(train_cov, 99))},
        },
        "DEV": {
            "token_count": {"1st_pct": float(np.percentile(dev_tokens, 1)), "50th_pct": float(np.percentile(dev_tokens, 50)), "99th_pct": float(np.percentile(dev_tokens, 99))},
            "vocab_coverage": {"1st_pct": float(np.percentile(dev_cov, 1)), "50th_pct": float(np.percentile(dev_cov, 50)), "99th_pct": float(np.percentile(dev_cov, 99))},
        },
        "proposed_flags": {
            "VERY_SHORT_INPUT": f"<{np.percentile(train_tokens, 1):.1f} tokens (based on 1st percentile of TRAIN)",
            "LOW_VOCABULARY_COVERAGE": f"<{np.percentile(train_cov, 1):.4f} coverage (based on 1st percentile of TRAIN)",
            "EXTREME_LENGTH": f">{np.percentile(train_tokens, 99):.1f} tokens (based on 99th percentile of TRAIN)"
        }
    }
    
    with open(r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\robustness_report.json", "w") as f:
        json.dump({"stability": stability, "diagnostics": diagnostics}, f, indent=4)
        
if __name__ == "__main__": main()
