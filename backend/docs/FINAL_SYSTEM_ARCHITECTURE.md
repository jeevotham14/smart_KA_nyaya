# Final System Architecture

## Execution Flow

```text
User
 ↓
FastAPI
 ↓
Input Validation
 ↓
Input Diagnostics
 ↓
Frozen Text Preprocessing
 ↓
Frozen OCR Normalization
 ↓
Frozen TF-IDF Vectorizer
 ↓
Frozen Logistic Regression Model
 ↓
Probability Output
 ↓
Confidence Policy
 ├── p <= 0.30 → High-confidence Class 0
 ├── p >= 0.70 → High-confidence Class 1
 └── otherwise → Human Review
 ↓
Safety Overrides
 ↓
Final API Response
```

## Safety Overrides

The system evaluates the raw input text. If input is deficient, it forcibly routes the case for manual review.

```text
<100 tokens
or
0 recognized features
→ INSUFFICIENT_INPUT
→ Human Review
```

## Note
Blockchain/ledger mechanisms have been successfully uncoupled and removed from the active architecture to ensure lean deployment.
