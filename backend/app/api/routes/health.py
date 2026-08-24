from fastapi import APIRouter
from typing import Dict, Any
import os
import json
import hashlib
from app.core.exceptions import ModelIntegrityError

def hash_artifact(path: str) -> str:
    sh = hashlib.sha256()
    with open(path, 'rb') as f:
        sh.update(f.read())
    return sh.hexdigest()

router = APIRouter(tags=["System Health"])

@router.get("/health")
def api_health() -> Dict[str, str]:
    return {
        "status": "healthy",
        "service": "smart-karnataka-nyaya-api"
    }

@router.get("/ready")
def api_ready() -> Dict[str, Any]:
    artifacts_dir = os.path.join(os.path.dirname(__file__), "../../ml/artifacts/final_model")
    model_path = os.path.join(artifacts_dir, "model.pkl")
    tfidf_path = os.path.join(artifacts_dir, "tfidf.pkl")
    meta_path = os.path.join(artifacts_dir, "final_model_metadata.json")
    
    if not (os.path.exists(model_path) and os.path.exists(tfidf_path) and os.path.exists(meta_path)):
        raise ModelIntegrityError("Prediction service is temporarily unavailable.", "MODEL_ARTIFACT_UNAVAILABLE")
        
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except Exception:
        raise ModelIntegrityError("Prediction service is temporarily unavailable.", "MODEL_ARTIFACT_UNAVAILABLE")
        
    # Verify hashes
    EXPECTED_MODEL = "f82c7987e27f8129d7a6a3ddac86047dfeec6cbf65a6159eb5e64fe90ff6cb5d"
    EXPECTED_TFIDF = "ea5bbafb2013ffaf8624390fa684d044b96fde0ffb810608af4cbf21acd46235"
    EXPECTED_META = "b2c06971571fd883641aaf3e4e091332dc7f6b36bf3db053692de337ef3e5cb7"
    
    if hash_artifact(model_path) != EXPECTED_MODEL or hash_artifact(tfidf_path) != EXPECTED_TFIDF or hash_artifact(meta_path) != EXPECTED_META:
        raise ModelIntegrityError("Prediction service is temporarily unavailable.", "MODEL_ARTIFACT_UNAVAILABLE")

    return {
        "status": "ready",
        "model_version": "ildc_clean_v1_final_baseline",
        "model_integrity": "VALID"
    }
