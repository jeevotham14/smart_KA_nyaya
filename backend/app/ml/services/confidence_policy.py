def evaluate_confidence(probability_class_1):
    if probability_class_1 <= 0.30:
        return {
            "prediction": 0,
            "band": "HIGH_CONFIDENCE_REJECTED",
            "human_review_required": False
        }
    elif probability_class_1 >= 0.70:
        return {
            "prediction": 1,
            "band": "HIGH_CONFIDENCE_ACCEPTED",
            "human_review_required": False
        }
    else:
        return {
            "prediction": 1 if probability_class_1 >= 0.5 else 0,
            "band": "UNCERTAIN",
            "human_review_required": True
        }
