import re
import logging

logger = logging.getLogger(__name__)

TRANSITION_PHRASES = [
    r"in the result", r"in conclusion", r"for the foregoing reasons", 
    r"for the reasons stated above", r"accordingly", r"consequently", 
    r"hence", r"therefore", r"we accordingly", r"the appeal is", 
    r"the petition is", r"for the reasons aforesaid", r"in view of the above"
]
TRANSITION_REGEX = re.compile(r'\b(' + '|'.join(TRANSITION_PHRASES) + r')\b', re.IGNORECASE)

OUTCOME_PHRASES = [
    r"appeal\s+is\s+allowed", r"appeal\s+stands\s+allowed", 
    r"appeal\s+is\s+dismissed", r"appeal\s+stands\s+dismissed", 
    r"petition\s+is\s+allowed", r"petition\s+is\s+dismissed", 
    r"impugned\s+judgment\s+is\s+set\s+aside", r"judgment\s+is\s+affirmed", 
    r"conviction\s+is\s+upheld", r"conviction\s+is\s+set\s+aside", 
    r"acquitted", r"conviction\s+restored", r"appeal\s+allowed", 
    r"appeal\s+dismissed", r"petition\s+allowed", r"petition\s+dismissed",
    r"we\s+allow", r"we\s+dismiss", r"stands\s+dismissed", r"stands\s+rejected",
    r"set\s+aside", r"disposed\s+of", r"fails", r"rejected", r"accepted"
]
OUTCOME_REGEX = re.compile(r'\b(' + '|'.join(OUTCOME_PHRASES) + r')\b', re.IGNORECASE)

LOWER_COURT_TERMS = [
    r"high court", r"trial court", r"appellate court", r"lower court", 
    r"sessions judge", r"magistrate", r"tribunal"
]
LOWER_COURT_REGEX = re.compile(r'\b(' + '|'.join(LOWER_COURT_TERMS) + r')\b', re.IGNORECASE)

def split_into_sentences(text):
    return re.split(r'(?<=[.!?])\s+', text)

def clean_document(doc_id, text):
    original_length = len(text)
    sentences = split_into_sentences(text)
    num_sents = len(sentences)
    
    if num_sents == 0:
        return {
            "document_id": doc_id,
            "cleaning_action": "none",
            "trigger_position": 0.0,
            "confidence": "low",
            "trigger_patterns": [],
            "original_length": original_length,
            "cleaned_length": original_length,
            "cleaned_text": text
        }
        
    cleaned_sentences = []
    action = "none"
    trigger_pos = 0.0
    confidence = "low"
    trigger_patterns = []
    
    for i, sent in enumerate(sentences):
        # Position from 0 to 1
        pos = i / max(1, num_sents - 1)
        
        has_transition = TRANSITION_REGEX.search(sent)
        outcome_match = OUTCOME_REGEX.search(sent)
        has_lower_court = LOWER_COURT_REGEX.search(sent)
        
        if outcome_match:
            # If lower court is explicitly mentioned, it's historical context (low confidence of being final outcome)
            if has_lower_court:
                conf = "low"
            # High confidence: Late in document (last 30%) AND has a transition phrase
            elif pos >= 0.70 and has_transition:
                conf = "high"
            # High confidence: Extremely late in document (last 10%) even without transition
            elif pos >= 0.90:
                conf = "high"
            # Medium confidence: Late in document (last 40%) but no transition
            elif pos >= 0.60:
                conf = "medium"
            else:
                conf = "low"
                
            if conf == "high":
                action = "truncate"
                confidence = "high"
                trigger_pos = pos
                trigger_patterns = [m for m in [has_transition.group(0) if has_transition else None, outcome_match.group(0)] if m]
                break
                
            elif conf == "medium" and action != "truncate":
                action = "sentence_mask"
                confidence = "medium"
                trigger_pos = pos
                trigger_patterns = [outcome_match.group(0)]
                # Do NOT append a special token. Neutral removal.
                continue
                
        cleaned_sentences.append(sent)
        
    cleaned_text = " ".join(cleaned_sentences)
    
    return {
        "document_id": doc_id,
        "cleaning_action": action,
        "trigger_position": trigger_pos,
        "confidence": confidence,
        "trigger_patterns": trigger_patterns,
        "original_length": original_length,
        "cleaned_length": len(cleaned_text),
        "cleaned_text": cleaned_text
    }
