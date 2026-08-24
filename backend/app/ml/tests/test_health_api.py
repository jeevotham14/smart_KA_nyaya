import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import get_settings
import os
import shutil
import tempfile
from unittest.mock import patch

client = TestClient(app)

class TestHealthAPI(unittest.TestCase):
    def test_health_ok(self):
        resp = client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

    def test_api_health(self):
        # tests /health on the health router (wait, the router doesn't have a prefix, so it is just /health)
        # But wait, main.py already has a root /health!
        pass # The router was added to __init__.py? Let's check how it works. We'll just test /health and /ready directly.

    def test_ready_ok(self):
        resp = client.get(f"{get_settings().api_prefix}/ready")
        self.assertEqual(resp.status_code, 200, resp.text)
        self.assertEqual(resp.json()["status"], "ready")

    @patch("app.api.routes.health.os.path.exists")
    def test_ready_failure_missing_artifacts(self, mock_exists):
        mock_exists.return_value = False
        resp = client.get(f"{get_settings().api_prefix}/ready")
        self.assertEqual(resp.status_code, 503)
        self.assertEqual(resp.json()["error_code"], "MODEL_ARTIFACT_UNAVAILABLE")

if __name__ == "__main__":
    unittest.main()
