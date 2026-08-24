import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.services.case_outcome_agent import _pred_service
from unittest.mock import patch, MagicMock
import numpy as np

client = TestClient(app)
API_PREFIX = "/api/v1" # Wait, I don't know the exact prefix, let's use the direct router. Actually, the prefix in main.py is settings.api_prefix. Usually /api/v1
# Let's import the routers directly and use a separate test app if prefix is unknown. Or just get it from settings.
from app.core.config import get_settings
settings = get_settings()
PREFIX = settings.api_prefix

class TestPredictionAPI(unittest.TestCase):
    
    def test_1_valid_request(self):
        text = "This is a valid case description. " * 50
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("prediction", data)
        
    def test_2_missing_case_text(self):
        resp = client.post(f"{PREFIX}/predict", json={})
        self.assertEqual(resp.status_code, 422) # FastAPI automatic validation
        
    def test_3_empty_case_text(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": ""})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("error", resp.json())
        
    def test_4_whitespace_only(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "     "})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("error", resp.json())
        
    def test_5_lt_100_tokens(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "Too short."})
        data = resp.json()
        self.assertEqual(data["confidence"]["band"], "INSUFFICIENT_INPUT")
        self.assertTrue(data["confidence"]["human_review_required"])
        
    def test_6_limited_info(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "word " * 150})
        data = resp.json()
        self.assertEqual(data["input_diagnostics"]["input_quality"], "LIMITED_INFORMATION")
        
    def test_7_sufficient_info(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "valid " * 300})
        data = resp.json()
        self.assertEqual(data["input_diagnostics"]["input_quality"], "SUFFICIENT_INFORMATION")

    def test_8_zero_recognized_features(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "asdfzxcv " * 150})
        data = resp.json()
        self.assertEqual(data["input_diagnostics"]["recognized_features"], 0)
        self.assertEqual(data["confidence"]["band"], "INSUFFICIENT_INPUT")
        
    def test_9_low_vocab_coverage(self):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "court " + "zxcv " * 149})
        data = resp.json()
        self.assertIn("LOW_VOCABULARY_COVERAGE", data["input_diagnostics"]["distribution_shift_flags"])
        
    def test_10_prob_le_30(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.80, 0.20]])):
            resp = client.post(f"{PREFIX}/predict", json={"case_text": "court appeal dismissed " * 50})
            data = resp.json()
            self.assertEqual(data["confidence"]["band"], "HIGH_CONFIDENCE_REJECTED")
            self.assertFalse(data["confidence"]["human_review_required"])
            self.assertEqual(data["prediction"]["class"], 0)

    def test_11_prob_ge_70(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.15, 0.85]])):
            resp = client.post(f"{PREFIX}/predict", json={"case_text": "court appeal allowed " * 50})
            data = resp.json()
            self.assertEqual(data["confidence"]["band"], "HIGH_CONFIDENCE_ACCEPTED")
            self.assertFalse(data["confidence"]["human_review_required"])
            self.assertEqual(data["prediction"]["class"], 1)

    def test_12_prob_between_30_70(self):
        with patch.object(_pred_service.model, 'predict_proba', return_value=np.array([[0.45, 0.55]])):
            resp = client.post(f"{PREFIX}/predict", json={"case_text": "court appeal pending " * 50})
            data = resp.json()
            self.assertEqual(data["confidence"]["band"], "UNCERTAIN")
            self.assertTrue(data["confidence"]["human_review_required"])

    def test_14_15_privacy_test(self):
        text = "John Doe 9876543210 john@example.com 123 Example Street"
        resp = client.post(f"{PREFIX}/predict", json={"case_text": text * 20})
        content = resp.text
        self.assertNotIn("John Doe", content)
        self.assertNotIn("9876543210", content)
        self.assertNotIn("john@example.com", content)

    @patch.object(_pred_service.model, 'fit')
    @patch.object(_pred_service.tfidf, 'fit')
    @patch.object(_pred_service.tfidf, 'fit_transform')
    def test_16_no_fit(self, mock_ft, mock_t_fit, mock_m_fit):
        resp = client.post(f"{PREFIX}/predict", json={"case_text": "valid " * 50})
        self.assertFalse(mock_ft.called)
        self.assertFalse(mock_t_fit.called)
        self.assertFalse(mock_m_fit.called)

if __name__ == '__main__':
    unittest.main()
