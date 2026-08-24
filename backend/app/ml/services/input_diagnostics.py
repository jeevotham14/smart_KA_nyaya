class InputDiagnosticsService:
    def __init__(self, tfidf_vectorizer=None):
        self.tfidf_vectorizer = tfidf_vectorizer

    def analyze_input(self, text, tfidf_matrix_row=None):
        """
        Analyzes user input text for domain compatibility and information sufficiency.
        """
        if not text or not str(text).strip():
            return self._build_empty_diagnostic()
            
        tokens = str(text).split()
        token_count = len(tokens)
        
        if token_count < 100:
            input_quality = "INSUFFICIENT_INFORMATION"
        elif token_count <= 250:
            input_quality = "LIMITED_INFORMATION"
        else:
            input_quality = "SUFFICIENT_INFORMATION"
            
        recognized_features = 0
        vocab_coverage = 0.0
        
        if tfidf_matrix_row is not None:
            recognized_features = int(tfidf_matrix_row.getnnz(axis=1)[0])
            vocab_coverage = recognized_features / float(token_count) if token_count > 0 else 0.0
        elif self.tfidf_vectorizer:
            X = self.tfidf_vectorizer.transform([text])
            recognized_features = int(X.getnnz(axis=1)[0])
            vocab_coverage = recognized_features / float(token_count) if token_count > 0 else 0.0
            
        flags = []
        if vocab_coverage < 0.10:
            flags.append("LOW_VOCABULARY_COVERAGE")
        if recognized_features == 0:
            flags.append("NO_RECOGNIZED_LEGAL_OR_FACTUAL_TERMS")
        if token_count > 25000:
            flags.append("UNUSUALLY_LONG_DESCRIPTION")
            
        return {
            "input_quality": input_quality,
            "token_count": token_count,
            "vocabulary_coverage": round(vocab_coverage, 4),
            "recognized_features": recognized_features,
            "distribution_shift_flags": flags
        }

    def _build_empty_diagnostic(self):
        return {
            "input_quality": "INSUFFICIENT_INFORMATION",
            "token_count": 0,
            "vocabulary_coverage": 0.0,
            "recognized_features": 0,
            "distribution_shift_flags": ["NO_RECOGNIZED_LEGAL_OR_FACTUAL_TERMS"]
        }
