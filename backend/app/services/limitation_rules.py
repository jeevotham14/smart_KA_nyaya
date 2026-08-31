from typing import Dict, Any, Optional

LIMITATION_RULES = [
    {
        "rule_id": "lim_money_recovery",
        "case_category": "civil",
        "proceeding_type": "money_recovery",
        "relief_type": "recovery_of_debt",
        "trigger_label": "When was the money due?",
        "period_years": 3,
        "legal_basis": "Limitation Act, 1963 - Article 18/21",
        "exceptions_note": "Written acknowledgment of debt before expiry renews the 3-year limitation clock."
    },
    {
        "rule_id": "lim_property_possession",
        "case_category": "property",
        "proceeding_type": "recovery_of_possession",
        "relief_type": "based_on_title",
        "trigger_label": "When did possession become adverse to the plaintiff?",
        "period_years": 12,
        "legal_basis": "Limitation Act, 1963 - Article 65",
        "exceptions_note": "Possession must be continuous, uninterrupted, and openly hostile (adverse possession) for 12 years."
    },
    {
        "rule_id": "lim_property_declaration",
        "case_category": "property",
        "proceeding_type": "declaration",
        "relief_type": "title",
        "trigger_label": "When did the right to sue first accrue?",
        "period_years": 3,
        "legal_basis": "Limitation Act, 1963 - Article 58",
        "exceptions_note": "Right to sue accrues when there is a clear and unequivocal threat to the right."
    },
    {
        "rule_id": "lim_property_specific_perf",
        "case_category": "property",
        "proceeding_type": "specific_performance",
        "relief_type": "contract",
        "trigger_label": "When was performance refused by the defendant?",
        "period_years": 3,
        "legal_basis": "Limitation Act, 1963 - Article 54",
        "exceptions_note": "If a date is fixed in the contract, limitation starts from that date. Otherwise, from the date of notice of refusal."
    },
    {
        "rule_id": "lim_property_cancellation",
        "case_category": "property",
        "proceeding_type": "cancellation_of_instrument",
        "relief_type": "document",
        "trigger_label": "When did the facts entitling you to have the instrument cancelled become known?",
        "period_years": 3,
        "legal_basis": "Limitation Act, 1963 - Article 59",
        "exceptions_note": "Knowledge of the instrument is the starting point."
    },
    {
        "rule_id": "lim_family_restitution",
        "case_category": "family",
        "proceeding_type": "restitution_of_conjugal_rights",
        "relief_type": "conjugal_rights",
        "trigger_label": "When was restitution demanded and refused?",
        "period_years": 1,
        "legal_basis": "Limitation Act, 1963 - Article 32",
        "exceptions_note": "Limitation starts from the date of refusal of the demand."
    }
]

def find_limitation_rule(category: str, proceeding: str, relief: str) -> Optional[Dict[str, Any]]:
    for rule in LIMITATION_RULES:
        if (rule["case_category"] == category and 
            rule["proceeding_type"] == proceeding and 
            (rule["relief_type"] == relief or rule["relief_type"] == "any")):
            return rule
            
    return None
