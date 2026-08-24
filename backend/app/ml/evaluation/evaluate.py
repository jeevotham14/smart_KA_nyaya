
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

def evaluate_model(model, X, y_true):
    y_pred = model.predict(X)
    
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average='binary', zero_division=0),
        "recall": recall_score(y_true, y_pred, average='binary', zero_division=0),
        "macro_f1": f1_score(y_true, y_pred, average='macro'),
        "weighted_f1": f1_score(y_true, y_pred, average='weighted'),
        "classification_report": classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    }
    
    conf_matrix = confusion_matrix(y_true, y_pred).tolist()
    
    # Majority class baseline
    majority_class = np.bincount(y_true).argmax()
    majority_acc = accuracy_score(y_true, [majority_class] * len(y_true))
    
    return metrics, conf_matrix, majority_acc
