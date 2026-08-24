import unittest
import numpy as np
from app.ml.services.case_outcome_agent import process_case
from app.ml.services.case_outcome_agent import _pred_service
from unittest.mock import patch, MagicMock

class TestCaseOutcomeAgent(unittest.TestCase):

    def test_valid_long_input(self):
        text = "This is a valid case description. " * 50
        res = process_case(text)
        self.assertIn("input_diagnostics", res)
        self.assertEqual(res["input_diagnostics"]["input_quality"], "SUFFICIENT_INFORMATION")

    def test_insufficient_input_token_count(self):
        text = "Too short."
        res = process_case(text)
        self.assertEqual(res["confidence"]["human_review_required"], True)
        self.assertEqual(res["confidence"]["band"], "INSUFFICIENT_INPUT")

    def test_limited_input(self):
        text = "word " * 150
        res = process_case(text)
        self.assertEqual(res["input_diagnostics"]["input_quality"], "LIMITED_INFORMATION")

    def test_zero_recognized_features(self):
        text = "asdjfkalsdjfklasdjflkasdjf " * 150
        res = process_case(text)
        self.assertEqual(res["input_diagnostics"]["recognized_features"], 0)
        self.assertEqual(res["confidence"]["band"], "INSUFFICIENT_INPUT")
        self.assertEqual(res["confidence"]["human_review_required"], True)

    def test_low_vocab_coverage(self):
        text = "court " + "asdfg " * 149
        res = process_case(text)
        self.assertIn("LOW_VOCABULARY_COVERAGE", res["input_diagnostics"]["distribution_shift_flags"])

    def test_probability_high_reject(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.80, 0.20]])):
            text = "court appeal dismissed " * 50
            res = process_case(text)
            self.assertEqual(res["confidence"]["band"], "HIGH_CONFIDENCE_REJECTED")
            self.assertEqual(res["confidence"]["human_review_required"], False)

    def test_probability_high_accept(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.15, 0.85]])):
            text = "court appeal allowed " * 50
            res = process_case(text)
            self.assertEqual(res["confidence"]["band"], "HIGH_CONFIDENCE_ACCEPTED")
            self.assertEqual(res["confidence"]["human_review_required"], False)

    def test_probability_uncertain(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.45, 0.55]])):
            text = "court appeal pending " * 50
            res = process_case(text)
            self.assertEqual(res["confidence"]["band"], "UNCERTAIN")
            self.assertEqual(res["confidence"]["human_review_required"], True)

if __name__ == '__main__':
    unittest.main()
