import os, glob, json, pandas as pd, numpy as np, random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

def get_tokens(text):
    return str(text).split()

def run_experiment():
    folder = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\data\processed"
    df_train = pd.concat([pd.read_parquet(f) for f in glob.glob(os.path.join(folder, "*train*_clean_v1.parquet"))])
    df_dev = pd.read_parquet(os.path.join(folder, "multi_dev-00000-of-00001_clean_v1.parquet"))
    
    tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=10000)
    X_train = tfidf.fit_transform(df_train['text'])
    y_train = df_train['label']
    y_dev = df_dev['label']
    
    clf = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)

    dev_texts = df_dev['text'].tolist()
    dev_tokens_list = [get_tokens(t) for t in dev_texts]

    def truncate_first(tokens, n):
        return " ".join(tokens[:n])
        
    def truncate_random(tokens, n, seed=42):
        random.seed(seed)
        if len(tokens) <= n:
            return " ".join(tokens)
        start = random.randint(0, len(tokens) - n)
        return " ".join(tokens[start:start+n])

    configurations = {
        "FIRST_100": [truncate_first(tk, 100) for tk in dev_tokens_list],
        "FIRST_250": [truncate_first(tk, 250) for tk in dev_tokens_list],
        "FIRST_500": [truncate_first(tk, 500) for tk in dev_tokens_list],
        "FIRST_1000": [truncate_first(tk, 1000) for tk in dev_tokens_list],
        "RANDOM_100": [truncate_random(tk, 100) for tk in dev_tokens_list],
        "RANDOM_250": [truncate_random(tk, 250) for tk in dev_tokens_list],
        "RANDOM_500": [truncate_random(tk, 500) for tk in dev_tokens_list],
        "FULL": dev_texts
    }
    
    results = {}
    for name, texts in configurations.items():
        X = tfidf.transform(texts)
        preds = clf.predict(X)
        probs = clf.predict_proba(X)
        
        acc = accuracy_score(y_dev, preds)
        f1 = f1_score(y_dev, preds, average='macro')
        precision = precision_score(y_dev, preds, average='macro')
        recall = recall_score(y_dev, preds, average='macro')
        
        non_zero = X.getnnz(axis=1)
        tokens_len = np.array([len(get_tokens(t)) for t in texts])
        coverage = non_zero / (tokens_len + 1e-9)
        avg_coverage = np.mean(coverage)
        zero_features_pct = np.mean(non_zero == 0) * 100
        
        max_probs = np.max(probs, axis=1)
        prob_dist = np.mean(max_probs - 0.5)
        
        results[name] = {
            "accuracy": acc,
            "macro_f1": f1,
            "precision": precision,
            "recall": recall,
            "zero_tfidf_features_percent": zero_features_pct,
            "avg_vocabulary_coverage": avg_coverage,
            "avg_probability_distance_from_0_5": prob_dist
        }

    out_file = r"C:\Users\HP-VICTUS\Downloads\major_project\backend\app\ml\artifacts\experiments\truncation_analysis.json"
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w") as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    run_experiment()
