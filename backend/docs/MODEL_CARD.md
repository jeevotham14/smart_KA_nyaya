# Final Model Card

**Model Name**: `ildc_clean_v1_final_baseline`
**Dataset**: REAL ILDC_multi
**Model Type**: TF-IDF + Logistic Regression

## Model Configuration
*   **TF-IDF Parameters**:
    *   ngram_range=(1,2)
    *   max_features=10000
*   **Logistic Regression Parameters**:
    *   Class weight: balanced
*   **Calibration**: Disabled
*   **Human-review Thresholds**: 0.30 / 0.70

## Final TEST Metrics
*   **Accuracy**: 60.65%
*   **Macro F1**: 60.43%
*   **Weighted F1**: 60.42%
*   **Brier Score**: 0.2317
*   **Log Loss**: 0.6550
*   **ECE**: 2.69%

## Selective Prediction
*   **High-confidence coverage**: 8.83%
*   **High-confidence accuracy**: 80.60%
*   **Human-review coverage**: 91.17%

## Limitations
*   ILDC contains Supreme Court appeal judgments.
*   Model does NOT predict general "win/lose".
*   Model does NOT predict conviction/acquittal.
*   Not Karnataka-specific.
*   Short citizen inputs are a domain shift.
*   Model is experimental decision support.
*   Human review is required for uncertain cases.
