# Smart Karnataka Nyaya (Backend)

## 1. Project Overview
Smart Karnataka Nyaya backend is an API that serves an experimental machine-learning outcome prediction model for legal texts.

## 2. Architecture
The ML flow strictly operates as a prediction inference engine using a pre-frozen baseline model (`ildc_clean_v1_final_baseline`). User input flows through validation and input diagnostics, gets cleaned via frozen OCR normalizations, vectorized via TF-IDF, and scores a probability using Logistic Regression. A selective prediction policy is implemented which acts as a confidence gate, routing cases for human review based on fixed thresholds or diagnostics flags.

See `docs/FINAL_SYSTEM_ARCHITECTURE.md` for full breakdown.

## 3. Installation
Ensure Python 3.9+ is installed.
```bash
pip install -r requirements.txt
```

## 4. Running Backend Locally
```bash
uvicorn app.main:app --reload --port 8000
```

## 5. API Endpoints
*   `POST /api/v1/predict` - Perform a case outcome prediction.
*   `GET /health` - Liveness probe.
*   `GET /api/v1/ready` - Readiness probe.

See `docs/API.md` for request/response details.

## 6. Model Information
*   **Model**: Logistic Regression + TF-IDF
*   **Version**: `ildc_clean_v1_final_baseline`
*   **Dataset**: REAL ILDC_multi dataset

See `docs/MODEL_CARD.md` for detailed specifications.

## 7. Final TEST Metrics
*   **TEST Accuracy**: 60.65%
*   **TEST Macro F1**: 60.43%

## 8. Human-Review Policy
Cases are securely and automatically routed to human review when the model probability falls strictly between 0.30 and 0.70 (inclusive bound uncertainties) OR whenever input texts are suspiciously short (less than 100 valid tokens) or missing recognizable TF-IDF features.

## 9. Limitations
*   ILDC contains Supreme Court appeal judgments.
*   Model does NOT predict general "win/lose".
*   Model does NOT predict conviction/acquittal.
*   Not Karnataka-specific.
*   Short citizen inputs are a domain shift.
*   Model is experimental decision support.
*   Human review is required for uncertain cases.

## 10. Future Work
*   Karnataka precedent retrieval (RAG/FAISS)
*   SHAP explanation support
*   Evidence-grounded recommendation engine
*   Kannada-native prediction models
