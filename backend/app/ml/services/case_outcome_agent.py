from typing import Dict, Any
from langgraph.graph import StateGraph, START, END
from app.ml.services.prediction_service import PredictionService

_pred_service = PredictionService()

def intake(state: dict) -> dict:
    return state

def offence_mapping(state: dict) -> dict:
    state["offence_mapping"] = {"status": "STUB"}
    return state

def precedent_retrieval(state: dict) -> dict:
    state["precedent_retrieval"] = {"status": "STUB"}
    return state

def outcome_prediction(state: dict) -> dict:
    text = state.get("text", "")
    res = _pred_service.predict(text)
    
    state["prediction"] = {
        "class": res["prediction"]["prediction"],
        "label": "ACCEPTED" if res["prediction"]["prediction"] == 1 else "REJECTED",
        "probability_class_1": res["prediction"]["probability_class_1"],
        "probability_class_0": res["prediction"]["probability_class_0"],
        "model_version": res["prediction"]["model_version"]
    }
    state["confidence"] = res["confidence"]
    state["input_diagnostics"] = res["input_diagnostics"]
    return state

def explanation(state: dict) -> dict:
    state["explanation"] = {"status": "STUB"}
    return state

def recommendation(state: dict) -> dict:
    state["recommendation"] = {"status": "STUB"}
    return state

def confidence_gate(state: dict) -> dict:
    return state

def draft_summary(state: dict) -> dict:
    state["draft_summary"] = "Summary generated automatically."
    state["final_node"] = "draft_summary"
    return state
    
def human_review(state: dict) -> dict:
    state["human_review"] = "Requires manual intervention."
    state["final_node"] = "human_review"
    return state

def confidence_router(state: dict):
    if state.get("confidence", {}).get("human_review_required", True):
        return "human_review"
    return "draft_summary"

def build_case_outcome_graph():
    graph = StateGraph(dict)
    
    graph.add_node("intake", intake)
    graph.add_node("offence_mapping", offence_mapping)
    graph.add_node("precedent_retrieval", precedent_retrieval)
    graph.add_node("outcome_prediction", outcome_prediction)
    graph.add_node("explanation", explanation)
    graph.add_node("recommendation", recommendation)
    graph.add_node("confidence_gate", confidence_gate)
    graph.add_node("draft_summary", draft_summary)
    graph.add_node("human_review", human_review)
    
    graph.add_edge(START, "intake")
    graph.add_edge("intake", "offence_mapping")
    graph.add_edge("offence_mapping", "precedent_retrieval")
    graph.add_edge("precedent_retrieval", "outcome_prediction")
    graph.add_edge("outcome_prediction", "explanation")
    graph.add_edge("explanation", "recommendation")
    graph.add_edge("recommendation", "confidence_gate")
    
    graph.add_conditional_edges(
        "confidence_gate",
        confidence_router,
        {"draft_summary": "draft_summary", "human_review": "human_review"}
    )
    
    graph.add_edge("draft_summary", END)
    graph.add_edge("human_review", END)
    
    return graph.compile()

def process_case(text: str) -> dict:
    app = build_case_outcome_graph()
    final_state = app.invoke({"text": text})
    
    return {
        "model_version": final_state.get("prediction", {}).get("model_version", "unknown"),
        "prediction": final_state.get("prediction", {}),
        "confidence": final_state.get("confidence", {}),
        "input_diagnostics": final_state.get("input_diagnostics", {}),
        "precedent_retrieval": final_state.get("precedent_retrieval", {}),
        "explanation": final_state.get("explanation", {}),
        "recommendation": final_state.get("recommendation", {}),
        "disclaimer": "Experimental decision-support output. This prediction is not legal advice and must not be treated as a guaranteed court outcome."
    }
