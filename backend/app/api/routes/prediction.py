from fastapi import APIRouter, Request
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging

from app.ml.services.case_outcome_agent import process_case
from app.core.exceptions import InputValidationError
from app.core.logging import log_prediction_event
from app.core.config import get_settings

router = APIRouter(prefix="/predict", tags=["prediction"])

class PredictionRequest(BaseModel):
    case_text: str

@router.post("")
def predict_case_outcome(request_data: PredictionRequest, request: Request) -> Dict[str, Any]:
    settings = get_settings()
    MAX_CHARS = getattr(settings, "MAX_REQUEST_TEXT_CHARS", 200000)
    
    text = request_data.case_text

    # Validation
    if not text or not text.strip():
        return {
            "error": "Validation Error",
            "message": "case_text must not be empty or whitespace only"
        }
        
    if len(text) > MAX_CHARS:
        raise InputValidationError("Input is too large for this prediction service.", "INPUT_TOO_LARGE")
    
    # Process case through LangGraph
    try:
        res = process_case(text)
    except FileNotFoundError:
        return {
            "error": "Model Error",
            "message": "Frozen model artifacts are missing."
        }
    except Exception as e:
        return {
            "error": "Internal Server Error",
            "message": "An error occurred during prediction."
        }
    
    request_id = getattr(request.state, "request_id", "unknown")
    model_version = res.get("model_version", "ildc_clean_v1_final_baseline")
    pred_class = res.get("prediction", {}).get("class", 0)
    conf_band = res.get("confidence", {}).get("band", "UNCERTAIN")
    hrr = res.get("confidence", {}).get("human_review_required", True)
    tc = res.get("input_diagnostics", {}).get("token_count", 0)
    rf = res.get("input_diagnostics", {}).get("recognized_features", 0)
    
    log_prediction_event(
        request_id=request_id,
        model_version=model_version,
        prediction_class=pred_class,
        confidence_band=conf_band,
        human_review_required=hrr,
        token_count=tc,
        recognized_features=rf
    )

    return {
        "request_id": request_id,
        "model_version": model_version,
        "prediction": {
            "class": pred_class,
            "label": "ACCEPTED" if pred_class == 1 else "REJECTED",
            "probability_class_1": res.get("prediction", {}).get("probability_class_1", 0.0),
            "probability_class_0": res.get("prediction", {}).get("probability_class_0", 1.0)
        },
        "confidence": {
            "band": conf_band,
            "human_review_required": hrr
        },
        "input_diagnostics": {
            "input_quality": res.get("input_diagnostics", {}).get("input_quality", "INSUFFICIENT_INFORMATION"),
            "token_count": tc,
            "vocabulary_coverage": res.get("input_diagnostics", {}).get("vocabulary_coverage", 0.0),
            "recognized_features": rf,
            "distribution_shift_flags": res.get("input_diagnostics", {}).get("distribution_shift_flags", [])
        },
        "precedent_retrieval": {
            "status": "STUB"
        },
        "explanation": {
            "status": "STUB"
        },
        "recommendation": {
            "status": "STUB"
        },
        "disclaimer": "Experimental decision-support output. This prediction is not legal advice and must not be treated as a guaranteed court outcome."
    }
