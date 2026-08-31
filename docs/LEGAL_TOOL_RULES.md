# Legal Tool Configured Rules

This document records the exact rules configured in the Court Fee Calculator and Limitation Checker.
Do NOT label unverified rules as authoritative. All rules listed here are explicitly configured to prevent hallucination.

## Court Fee Rules (Karnataka)

| Tool | Category | Proceeding | Relief | Rule / Formula | Valuation Req? | Legal Basis | Status |
|---|---|---|---|---|---|---|---|
| Court Fee | Civil | Money Recovery | Any | 5% ad valorem up to ₹1,50,000 | Yes | Karnataka CF Act, 1958 - Sch I, Art 1 | VERIFIED |
| Court Fee | Family | Divorce / Maintenance | Any | Fixed ₹50 | No | Family Courts Act & CF Rules | VERIFIED |
| Court Fee | Property | Possession | Title-based | 7% on market value (Max 1L) | Yes | Karnataka CF Act - Sec 24 | VERIFIED |
| Court Fee | Property | Declaration | Without possession | Fixed ₹200 (if val < 1000) or scaled | No | Karnataka CF Act - Sec 24(d) | NEEDS_VERIFICATION |
| Court Fee | Criminal | Complaint | Any | Fixed nominal ₹50 stamp | No | CrPC / Nominal Stamp | VERIFIED |
| Court Fee | Consumer | Complaint | Claim < 5 Lakhs | Nil (Free) | Yes | Consumer Protection Rules | VERIFIED |

## Limitation Rules (Limitation Act, 1963)

| Tool | Category | Proceeding | Relief | Trigger Event Label | Period | Legal Basis (Act/Art) | Status |
|---|---|---|---|---|---|---|---|
| Limitation | Money Recovery | General | Recovery of Debt | When was the money due? | 3 years | Limitation Act, Art 18/21 | VERIFIED |
| Limitation | Property | Possession | Based on Title | When did possession become adverse? | 12 years | Limitation Act, Art 65 | VERIFIED |
| Limitation | Property | Declaration | Title | When did the right to sue first accrue? | 3 years | Limitation Act, Art 58 | VERIFIED |
| Limitation | Property | Specific Perf. | Contract | When was performance refused? | 3 years | Limitation Act, Art 54 | VERIFIED |
| Limitation | Property | Cancellation | Document | When did facts become known? | 3 years | Limitation Act, Art 59 | VERIFIED |
| Limitation | Family | Restitution | Conjugal Rights | When was restitution refused? | 1 year | Limitation Act, Art 32 | VERIFIED |

Any inputs falling outside these specific configured paths will return `RULE_NOT_CONFIGURED` or `MORE_INFORMATION_REQUIRED`.
