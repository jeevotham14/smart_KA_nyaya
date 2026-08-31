from typing import Dict, Any, Optional

COURT_FEE_RULES = [
    {
        "rule_id": "cf_civil_money",
        "case_category": "civil",
        "proceeding_type": "money_recovery",
        "relief_type": "any",
        "valuation_required": True,
        "valuation_label": "Claim / Suit Value (₹)",
        "calculation_type": "percentage",
        "base_fee": 100,
        "percentage": 0.05,
        "max_fee": 150000,
        "legal_basis": "Karnataka Court Fees and Suits Valuation Act, 1958 - Schedule I, Article 1",
        "notes": "Ad valorem fee @ 5% on claim value subject to statutory maximum in subordinate civil courts.",
        "jurisdiction": "Karnataka"
    },
    {
        "rule_id": "cf_family_general",
        "case_category": "family",
        "proceeding_type": "divorce_maintenance",
        "relief_type": "any",
        "valuation_required": False,
        "calculation_type": "fixed",
        "fixed_fee": 50,
        "legal_basis": "Family Courts Act, 1984 & Karnataka Court Fee Rules",
        "notes": "Fixed nominal court fee of ₹50 for maintenance and family petitions under Karnataka Family Court rules.",
        "jurisdiction": "Karnataka"
    },
    {
        "rule_id": "cf_property_possession",
        "case_category": "property",
        "proceeding_type": "possession",
        "relief_type": "title_based",
        "valuation_required": True,
        "valuation_label": "Property Market Value (₹)",
        "calculation_type": "percentage",
        "base_fee": 200,
        "percentage": 0.07,
        "max_fee": 100000,
        "legal_basis": "Karnataka Court Fees Act - Section 24",
        "notes": "Based on guidance value / market value of property in Karnataka with 7% ad valorem rate.",
        "jurisdiction": "Karnataka"
    },
    {
        "rule_id": "cf_property_declaration",
        "case_category": "property",
        "proceeding_type": "declaration",
        "relief_type": "without_possession",
        "valuation_required": False,
        "calculation_type": "fixed",
        "fixed_fee": 200,
        "legal_basis": "Karnataka Court Fees Act - Section 24(d)",
        "notes": "Fixed fee for declaration without consequential relief.",
        "jurisdiction": "Karnataka"
    },
    {
        "rule_id": "cf_criminal_complaint",
        "case_category": "criminal",
        "proceeding_type": "complaint",
        "relief_type": "any",
        "valuation_required": False,
        "calculation_type": "fixed",
        "fixed_fee": 50,
        "legal_basis": "CrPC / Karnataka Stamp Act",
        "notes": "Nominal stamp fee for criminal complaints.",
        "jurisdiction": "Karnataka"
    },
    {
        "rule_id": "cf_consumer_complaint",
        "case_category": "consumer",
        "proceeding_type": "complaint",
        "relief_type": "under_5_lakhs",
        "valuation_required": True,
        "valuation_label": "Claim Value (₹)",
        "calculation_type": "fixed",
        "fixed_fee": 0,
        "legal_basis": "Consumer Protection Rules, 2020",
        "notes": "No fee for claims up to ₹5 Lakhs.",
        "jurisdiction": "Karnataka"
    }
]

def find_court_fee_rule(category: str, proceeding: str, relief: str) -> Optional[Dict[str, Any]]:
    # Attempt strict match
    for rule in COURT_FEE_RULES:
        if (rule["case_category"] == category and 
            rule["proceeding_type"] == proceeding and 
            (rule["relief_type"] == relief or rule["relief_type"] == "any")):
            return rule
            
    return None
