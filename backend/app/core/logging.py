import logging
import json

logger = logging.getLogger("smart_karnataka_nyaya")
logger.setLevel(logging.INFO)

if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)

def log_prediction_event(
    request_id: str,
    model_version: str,
    prediction_class: int,
    confidence_band: str,
    human_review_required: bool,
    token_count: int,
    recognized_features: int
):
    """
    Logs structured privacy-safe prediction operational metadata.
    """
    event = {
        "event": "prediction_request_completed",
        "request_id": request_id,
        "model_version": model_version,
        "prediction_class": prediction_class,
        "confidence_band": confidence_band,
        "human_review_required": human_review_required,
        "token_count": token_count,
        "recognized_features": recognized_features
    }
    
    # We output structured JSON-like or key=value logs. Key=value is typical for text logs.
    log_msg = " ".join([f"{k}={v}" for k, v in event.items() if v is not None])
    logger.info(log_msg)
