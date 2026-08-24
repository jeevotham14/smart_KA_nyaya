import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.services.case_outcome_agent import _pred_service
from unittest.mock import patch
import numpy as np
from app.core.config import get_settings
import os
import json

client = TestClient(app)
PREFIX = get_settings().api_prefix

class TestEndToEndWorkflow(unittest.TestCase):
    def test_1_complete_prediction_flow(self):
        # Actual end-to-end request
        text = "This is a standard legal case involving a property dispute. " * 50
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        
        self.assertEqual(data["model_version"], "ildc_clean_v1_final_baseline")
        self.assertIn("prediction", data)
        self.assertIn("confidence", data)
        self.assertIn("input_diagnostics", data)
        self.assertEqual(data["precedent_retrieval"]["status"], "STUB")
        self.assertEqual(data["explanation"]["status"], "STUB")
        self.assertEqual(data["recommendation"]["status"], "STUB")
        self.assertIn("disclaimer", data)

    @patch.object(_pred_service.model, 'predict_proba')
    def test_2_confidence_paths(self, mock_proba):
        # Path A - High confidence rejected
        mock_proba.return_value = np.array([[0.80, 0.20]])
        text = "court appeal dismissed " * 50
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "HIGH_CONFIDENCE_REJECTED")
        self.assertFalse(data["confidence"]["human_review_required"])

        # Path B - High confidence accepted
        mock_proba.return_value = np.array([[0.20, 0.80]])
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "HIGH_CONFIDENCE_ACCEPTED")
        self.assertFalse(data["confidence"]["human_review_required"])

        # Path C - Uncertain
        mock_proba.return_value = np.array([[0.50, 0.50]])
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "UNCERTAIN")
        self.assertTrue(data["confidence"]["human_review_required"])

    @patch.object(_pred_service.model, 'predict_proba')
    def test_3_safety_override_precedence(self, mock_proba):
        # Case 1: < 100 tokens with 0.95 probability
        mock_proba.return_value = np.array([[0.05, 0.95]])
        text = "Too short case text."
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "INSUFFICIENT_INPUT")
        self.assertTrue(data["confidence"]["human_review_required"])

        # Case 2: 0 recognized features with 0.05 probability
        mock_proba.return_value = np.array([[0.95, 0.05]])
        text = "xyzabc " * 50
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "INSUFFICIENT_INPUT")
        self.assertTrue(data["confidence"]["human_review_required"])

    def test_4_input_quality_levels(self):
        # A. Extremely short
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "Short."})
        self.assertEqual(resp.json()["input_diagnostics"]["input_quality"], "INSUFFICIENT_INFORMATION")

        # B. Limited
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "word " * 150})
        self.assertEqual(resp.json()["input_diagnostics"]["input_quality"], "LIMITED_INFORMATION")

        # C. Sufficient
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "word " * 300})
        self.assertEqual(resp.json()["input_diagnostics"]["input_quality"], "SUFFICIENT_INFORMATION")
        
        # Coverage < 0.10
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "court " + "xyzabc " * 150})
        self.assertIn("LOW_VOCABULARY_COVERAGE", resp.json()["input_diagnostics"]["distribution_shift_flags"])



    def test_7_api_error_handling(self):
        # Empty input -> HTTP 422
        resp = client.post(f"{PREFIX}/predict", json={})
        self.assertEqual(resp.status_code, 422)

        # Missing model artifact -> HTTP 503
        with patch("app.api.routes.prediction.process_case", side_effect=FileNotFoundError):
            resp = client.post(f"{PREFIX}/predict", json={"case_text": "valid case " * 50})
            self.assertEqual(resp.status_code, 200) # Our app catches it and returns 200 with an error object
            self.assertEqual(resp.json()["error"], "Model Error")

    def test_8_health_readiness(self):
        resp = client.get("/health")
        self.assertEqual(resp.status_code, 200)

        resp = client.get(f"{PREFIX}/ready")
        self.assertEqual(resp.status_code, 200)

    def test_9_request_id_and_logs(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "Case for request ID test." * 50})
        self.assertIn("X-Request-ID", resp.headers)
        data = resp.json()
        self.assertIn("request_id", data)

if __name__ == '__main__':
    unittest.main()
