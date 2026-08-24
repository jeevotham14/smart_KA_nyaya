# API Documentation

## Endpoints

### 1. `POST /api/predict`
Predict the outcome of a case given the raw text.

**Request:**
```json
{
  "case_text": "..."
}
```

**Response Fields:**
*   `request_id`: Tracing request ID.
*   `model_version`: The frozen model version (e.g., `ildc_clean_v1_final_baseline`).
*   `prediction`: Prediction dictionary containing `class`, `label`, `probability_class_0`, and `probability_class_1`.
*   `confidence`: Contains `band` and `human_review_required`.
*   `input_diagnostics`: Contains `input_quality`, `token_count`, `vocabulary_coverage`, `recognized_features`, and `distribution_shift_flags`.
*   `precedent_retrieval`: Mock stub.
*   `explanation`: Mock stub.
*   `recommendation`: Mock stub.
*   `disclaimer`: Standard disclaimer noting the experimental nature of the tool.

**Validation Errors:**
*   **Missing `case_text`**: `HTTP 422 Unprocessable Entity`
*   **Empty `case_text`**: Handled via internal validation (Returns `"error": "Validation Error"`).
*   **Input too large**: Raised when token counts exceed safety caps, returning validation errors.
*   **Model unavailable**: Handled via internal validation (Returns `"error": "Model Error"`).

### 2. `GET /health`
Returns process-level liveness. (Can also be available at `/api/v1/health` depending on prefixing).

### 3. `GET /api/v1/ready`
Returns model readiness status (checks loading of the frozen artifacts).
