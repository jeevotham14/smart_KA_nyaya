
import os
import joblib
import json
import logging
from app.ml.data.load_ildc import load_ildc_data
from app.ml.evaluation.evaluate import evaluate_model
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_baseline():
    logger.info("Loading ILDC Dataset (using small sample for fast baseline execution)...")
    df_train, df_dev, df_test = load_ildc_data(sample_size=1000) # Use 1000 for fast CI/CD baseline
    
    logger.info(f"Training set: {len(df_train)} rows")
    logger.info(f"Dev set: {len(df_dev)} rows")
    
    logger.info("Vectorizing text with TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', max_df=0.9, min_df=5)
    
    X_train = vectorizer.fit_transform(df_train['text'])
    y_train = df_train['label']
    
    X_dev = vectorizer.transform(df_dev['text'])
    y_dev = df_dev['label']
    
    logger.info("Training Logistic Regression Baseline...")
    # class_weight='balanced' handles the 69/31 ILDC imbalance
    model = LogisticRegression(class_weight='balanced', random_state=42, max_iter=1000)
    model.fit(X_train, y_train)
    
    logger.info("Evaluating on Dev split...")
    metrics, conf_matrix, majority_acc = evaluate_model(model, X_dev, y_dev)
    
    # Save artifacts
    artifacts_dir = os.path.join(os.path.dirname(__file__), '../artifacts')
    
    joblib.dump(model, os.path.join(artifacts_dir, 'models/baseline_logreg.pkl'))
    joblib.dump(vectorizer, os.path.join(artifacts_dir, 'vectorizers/tfidf.pkl'))
    
    metadata = {
        "model_architecture": "TF-IDF + LogisticRegression",
        "dataset_splits": {
            "train": len(df_train),
            "dev": len(df_dev),
            "test": len(df_test)
        },
        "metrics": metrics,
        "majority_class_baseline_accuracy": majority_acc,
        "hyperparameters": {
            "max_features": 5000,
            "class_weight": "balanced",
            "random_state": 42
        }
    }
    
    with open(os.path.join(artifacts_dir, 'metrics/baseline_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=4)
        
    logger.info("Baseline training complete. Artifacts saved.")
    print("\n--- TRAINING RESULTS ---")
    print(json.dumps(metadata, indent=2))
    
    if metrics['accuracy'] > majority_acc:
        print("\nRESULT: Model IS genuinely better than majority-class baseline.")
    else:
        print("\nRESULT: Model is NOT better than majority-class baseline.")

if __name__ == '__main__':
    train_baseline()
