"""
Karnataka Legal Tools Reference Schedules & Rights Data
Under Karnataka Court Fees and Suits Valuation Act, 1958 & Limitation Act, 1963.
"""

KARNATAKA_COURT_FEES = {
    "civil": {
        "name": "Civil Suit for Money / Damages",
        "base_fee": 100,
        "percentage": 0.05,
        "max_fee": 50000,
        "schedule": "Karnataka Court Fees and Suits Valuation Act, 1958 - Schedule I, Article 1",
        "details": "Ad valorem fee @ 5% on claim value subject to statutory maximum of ₹50,000 in subordinate civil courts."
    },
    "civil_suit": {
        "name": "Civil Suit for Money / Damages",
        "base_fee": 100,
        "percentage": 0.05,
        "max_fee": 50000,
        "schedule": "Karnataka Court Fees and Suits Valuation Act, 1958 - Schedule I, Article 1",
        "details": "Ad valorem fee @ 5% on claim value subject to statutory maximum of ₹50,000 in subordinate civil courts."
    },
    "family": {
        "name": "Family Court Petition (Divorce / Custody / Maintenance)",
        "base_fee": 50,
        "percentage": 0,
        "max_fee": 100,
        "schedule": "Family Courts Act, 1984 & Karnataka Court Fee Rules",
        "details": "Fixed nominal court fee of ₹50 for maintenance and family petitions under Karnataka Family Court rules."
    },
    "family_court": {
        "name": "Family Court Petition (Divorce / Custody / Maintenance)",
        "base_fee": 50,
        "percentage": 0,
        "max_fee": 100,
        "schedule": "Family Courts Act, 1984 & Karnataka Court Fee Rules",
        "details": "Fixed nominal court fee of ₹50 for maintenance and family petitions under Karnataka Family Court rules."
    },
    "appeal": {
        "name": "Regular First Appeal (RFA / Civil Appeal)",
        "base_fee": 200,
        "percentage": 0.04,
        "max_fee": 60000,
        "schedule": "Karnataka Court Fees Act - Schedule I, Article 4 (Appeals)",
        "details": "Calculated on subject matter of appeal or decretal amount in dispute @ 4%."
    },
    "property": {
        "name": "Property Dispute / Declaration / Injunction",
        "base_fee": 200,
        "percentage": 0.07,
        "max_fee": 100000,
        "schedule": "Karnataka Court Fees Act - Section 24 & 26",
        "details": "Based on guidance value / market value of property in Karnataka with 7% ad valorem rate."
    },
    "property_dispute": {
        "name": "Property Dispute / Declaration / Injunction",
        "base_fee": 200,
        "percentage": 0.07,
        "max_fee": 100000,
        "schedule": "Karnataka Court Fees Act - Section 24 & 26",
        "details": "Based on guidance value / market value of property in Karnataka with 7% ad valorem rate."
    }
}

LIMITATION_PERIODS = {
    "money_recovery": {
        "period_years": 3,
        "description": "3 years from the date the loan became due or last acknowledged in writing (Limitation Act Article 19-21).",
        "notes": "Written acknowledgment of debt under Section 18 renews the 3-year limitation clock."
    },
    "money_lending": {
        "period_years": 3,
        "description": "3 years from the date the loan became due or last acknowledged in writing (Limitation Act Article 19-21).",
        "notes": "Written acknowledgment of debt under Section 18 renews the 3-year limitation clock."
    },
    "breach_of_contract": {
        "period_years": 3,
        "description": "3 years from the date when the contract is broken or the breach occurred (Limitation Act Article 55).",
        "notes": "If successive breaches happen, each breach triggers its own limitation period."
    },
    "property_dispute": {
        "period_years": 12,
        "description": "12 years for recovery of immovable property based on title or adverse possession (Limitation Act Article 65).",
        "notes": "For declaration of title without possession claim, limitation is 3 years under Article 58."
    },
    "property_recovery": {
        "period_years": 12,
        "description": "12 years for recovery of immovable property based on title or adverse possession (Limitation Act Article 65).",
        "notes": "For declaration of title without possession claim, limitation is 3 years under Article 58."
    },
    "tort_defamation": {
        "period_years": 1,
        "description": "1 year from the date the defamatory words were spoken or libel published (Limitation Act Article 75-76).",
        "notes": "Civil damages must be filed within 1 year; criminal complaint under BNS / IPC within general magistrate jurisdiction."
    },
    "defamation": {
        "period_years": 1,
        "description": "1 year from the date the defamatory words were spoken or libel published (Limitation Act Article 75-76).",
        "notes": "Civil damages must be filed within 1 year; criminal complaint under BNS / IPC within general magistrate jurisdiction."
    }
}

RIGHTS_INFO = {
    "consumer rights": {
        "title": "Consumer Protection Rights",
        "rights": [
            "Right to Safety against hazardous goods and services",
            "Right to be Informed about quality, quantity, potency, purity, standard and price",
            "Right to Choose from a variety of goods at competitive prices",
            "Right to be Heard at appropriate consumer forums (DCDRC / KSCDRC)",
            "Right to Seek Redressal against unfair trade practice or exploitation",
            "Right to Consumer Awareness and Education"
        ],
        "laws": ["Consumer Protection Act, 2019", "Consumer Protection (E-Commerce) Rules, 2020", "Legal Metrology Act, 2009"],
        "documents": ["Original Purchase Invoice / Cash Receipt", "Warranty / Guarantee Card", "Written Complaint or Email Communication with Seller", "Photos / Video Evidence of Defect", "Payment Proof (Bank Statement / UPI Ref)"],
        "authority": "District Consumer Disputes Redressal Commission (DCDRC) or National Consumer Helpline (1915 / consumerhelpline.gov.in)",
        "timeLimit": "2 years from the date on which cause of action arose (Sec 69 Consumer Protection Act 2019).",
        "process": "1. Send legal notice to seller/service provider -> 2. File e-Daakhil consumer complaint -> 3. Notice issued -> 4. Mediation / Hearing -> 5. Final order with refund & compensation.",
        "outcomes": ["Full replacement of defective product", "100% refund of amount paid with interest", "Compensation for physical/mental harassment", "Punitive damages against unfair trade practice"]
    },
    "tenant rights": {
        "title": "Karnataka Tenant & Rent Protection Rights",
        "rights": [
            "Right against illegal and forceful eviction without due court process",
            "Right to essential municipal services (water, electricity, sanitation) without landlord cutoff",
            "Right to formal rent receipts upon monthly payment",
            "Right to reasonable notice (at least 30 days) prior to tenancy termination",
            "Right to refund of security deposit within 30 days of vacating after deductions"
        ],
        "laws": ["Karnataka Rent Act, 1999", "Transfer of Property Act, 1882", "Model Tenancy Act provisions"],
        "documents": ["Registered / Notarized Rental Agreement", "Monthly Rent Receipts / Bank Transfer Statements", "Electricity & Water Bill Records", "Written notice exchanged via email / WhatsApp / speed post"],
        "authority": "Rent Controller / Small Causes Court / DLSA Karnataka",
        "timeLimit": "Civil suit for deposit recovery: 3 years from tenancy end. Injunction against illegal eviction: Immediate.",
        "process": "1. Review rental agreement terms -> 2. Issue advocate legal notice for deposit refund / eviction stoppage -> 3. File petition before Rent Court / Small Causes Court.",
        "outcomes": ["Injunction restraining landlord from forcible eviction", "Court order for return of security deposit with interest", "Restoration of disconnected electricity/water amenities"]
    },
    "employee rights": {
        "title": "Employee & Labour Rights in Karnataka",
        "rights": [
            "Right to statutory minimum wages under Karnataka Minimum Wages Notifications",
            "Right to timely payment of monthly salary on or before 7th/10th of every month",
            "Protection against wrongful termination without notice period or severance pay",
            "Right to safe working environment and POSH prevention mechanism",
            "Right to Gratuity (after 5 continuous years) and Provident Fund (EPF) benefits"
        ],
        "laws": ["Karnataka Shops and Commercial Establishments Act, 1961", "Payment of Wages Act, 1936", "Industrial Disputes Act, 1947", "Payment of Gratuity Act, 1972"],
        "documents": ["Appointment Letter / Employment Contract", "Salary Slips for last 3-6 months", "Bank Account Statement showing salary credit", "Experience Letter / Relieving Letter / Termination Email", "PF Account details (UAN Number)"],
        "authority": "Karnataka Labour Commissionerate, Labour Officer / Conciliation Officer, Labour Court Bangalore",
        "timeLimit": "Wage dispute: 1 year from due date. Gratuity recovery: 30 days after leaving. Wrongful dismissal: within 3 years.",
        "process": "1. Submit representation to HR -> 2. File grievance on Karnataka e-Karmika portal -> 3. Conciliation by Labour Officer -> 4. Labour Court adjudication if unresolved.",
        "outcomes": ["Recovery of unpaid salary and allowances with penalty", "Payment of statutory gratuity and leave encashment", "Compensation for unlawful termination"]
    },
    "women’s rights": {
        "title": "Women’s Legal & Safety Rights",
        "rights": [
            "Right to zero tolerance against sexual harassment at workplace (POSH Act)",
            "Right to free legal aid from DLSA regardless of family income (Legal Services Authorities Act Sec 12)",
            "Right to protection from domestic violence, right to reside in shared household",
            "Right to file Zero FIR at any police station irrespective of jurisdictional boundaries",
            "Right to privacy during recording of statements (Sec 164 CrPC / BNSS) before a woman magistrate"
        ],
        "laws": ["Protection of Women from Domestic Violence Act, 2005", "Sexual Harassment of Women at Workplace (POSH) Act, 2013", "BNS / IPC provisions for women protection"],
        "documents": ["Government Identity Proof (Aadhaar / Voter ID)", "Medical examination records / injury reports", "WhatsApp chats / Call recordings / CCTV footage", "Protection Officer incident report (DIR Form 1)"],
        "authority": "Karnataka State Commission for Women, Sakhi One Stop Centers, Protection Officers, Local Police (112 / 181)",
        "timeLimit": "Domestic violence relief: Immediate / ongoing. POSH complaint: Within 3 months of incident to Internal Committee.",
        "process": "1. Approach Sakhi Center / Protection Officer -> 2. File Form I petition before Magistrate -> 3. Interim protection order within 3 days -> 4. Maintenance & residence relief granted.",
        "outcomes": ["Ex-parte protection orders restraining respondent", "Monthly interim maintenance and child custody", "Right of residence in marital/shared home", "Compensation for emotional and bodily injuries"]
    },
    "right to information (rti)": {
        "title": "Right to Information (RTI) in Karnataka",
        "rights": [
            "Right to inspect public works, documents, and records of government departments",
            "Right to obtain certified copies, samples, and electronic data from Public Authorities",
            "Right to receive response within 30 days (48 hours if life or liberty is involved)",
            "Right to file First Appeal if information is refused, delayed, or misleading"
        ],
        "laws": ["Right to Information Act, 2005", "Karnataka Right to Information Rules, 2005"],
        "documents": ["RTI Application Form (Form A)", "Proof of ₹10 application fee payment (IPO / Court Fee Stamp / Online KII Portal)", "Previous RTI query and denial letter (for Appeals)"],
        "authority": "Public Information Officer (PIO), First Appellate Authority (FAA), Karnataka Information Commission (KIC)",
        "timeLimit": "PIO response: 30 days. First Appeal: within 30 days of expiry. Second Appeal to KIC: within 90 days.",
        "process": "1. Submit Form A RTI request to PIO with ₹10 fee -> 2. Await 30 days -> 3. File First Appeal with FAA -> 4. File Second Appeal before Karnataka Information Commission.",
        "outcomes": ["Disclosure of requested public documents", "Penalty of ₹250/day (up to ₹25,000) on errant PIO", "Disciplinary action recommendation against PIO"]
    },
    "cybercrime victims": {
        "title": "Cybercrime Victim Rights & Protections",
        "rights": [
            "Right to immediate financial freeze of fraudulent bank transactions (Call 1930 within golden hour)",
            "Right to confidentiality and removal of non-consensual explicit imagery (within 24 hours under IT Rules)",
            "Right to compensation for data breaches and unauthorized access under Section 43A IT Act",
            "Right to digital FIR registration on National Cyber Crime Reporting Portal (cybercrime.gov.in)"
        ],
        "laws": ["Information Technology Act, 2000", "Bharatiya Nyaya Sanhita (BNS) Cyber Offences", "RBI Digital Payment Fraud Guidelines"],
        "documents": ["Bank Account Statement showing unauthorized debit", "Transaction reference number (UTR / UPI Ref ID)", "Screenshots of phishing SMS / scam WhatsApp messages / URL links", "Audio call recordings and suspect phone numbers"],
        "authority": "National Cyber Crime Helpline (1930), cybercrime.gov.in, Karnataka Cyber Crime Police Stations (CEN Stations)",
        "timeLimit": "Financial fraud: Report immediately within 1-2 hours for bank freeze. IT Act civil claim: 3 years.",
        "process": "1. Call 1930 immediately to freeze funds -> 2. Lodge complaint on cybercrime.gov.in -> 3. Submit complaint copy to bank manager -> 4. Obtain Crime Investigation Report from CEN Police.",
        "outcomes": ["Lien freeze and reversal of stolen funds to bank account", "Takedown of fake social media profiles and offensive content", "Prosecution of cyber offenders under IT Act"]
    },
    "domestic violence": {
        "title": "Domestic Violence Protection & Maintenance",
        "rights": [
            "Right to secure Protection Orders prohibiting abuser from committing any violence",
            "Right to continue residing in the shared household without being thrown out",
            "Right to monthly interim monetary relief and child maintenance under Section 20",
            "Right to temporary custody of children under Section 21",
            "Right to free medical care and shelter home admission"
        ],
        "laws": ["Protection of Women from Domestic Violence Act, 2005 (PWDVA)", "BNS Section 85/86 (Cruelty by Husband or Relatives)"],
        "documents": ["Marriage Certificate / Wedding Invitation Card", "Medical records / wound certificate from government hospital", "Proof of income of respondent husband (ITR / Pay Slip / Bank records)", "Photographs of injuries and distress communication"],
        "authority": "Judicial Magistrate First Class (JMFC) / Metropolitan Magistrate Bangalore, Protection Officer, DLSA Karnataka",
        "timeLimit": "Ongoing relief available anytime during cohabitation or subsequent domestic dispute.",
        "process": "1. Approach Protection Officer / DLSA -> 2. File Domestic Incident Report (DIR) -> 3. First hearing before Magistrate within 3 days -> 4. Immediate Interim Order granted.",
        "outcomes": ["Protection order prohibiting abuser contact", "Mandatory monthly maintenance paid directly to victim", "Residence order securing uninterrupted stay in home", "Compensation for mental distress and injuries"]
    },
    "property rights": {
        "title": "Property & Inheritance Rights in Karnataka",
        "rights": [
            "Equal coparcenary rights for daughters in ancestral property (Hindu Succession Amendment Act)",
            "Right to seek partition and separate possession of ancestral joint family assets",
            "Right of bona fide purchaser against fraudulent double sales and forged title deeds",
            "Right to registration of sale deed under Karnataka Bhoomi & Kaveri 2.0 land records systems"
        ],
        "laws": ["Hindu Succession Act, 1956", "Transfer of Property Act, 1882", "Karnataka Land Revenue Act, 1964", "Specific Relief Act, 1963"],
        "documents": ["Registered Sale Deed / Title Deed", "Kaveri 2.0 Encumbrance Certificate (EC) for 30 years", "Bhoomi RTC (Pahani) / Mutation Register Extract", "Khata Certificate (A Khata / E-Khata) from BBMP / Gram Panchayat", "Family Tree / Genealogy Certificate"],
        "authority": "Civil Court (Senior Civil Judge / District Court), Tahsildar / Assistant Commissioner Revenue Court",
        "timeLimit": "Partition suit: 12 years from adverse possession. Cancellation of forged deed: 3 years from knowledge.",
        "process": "1. Verify 30-year EC on Kaveri 2.0 -> 2. Issue legal notice for partition -> 3. File Civil Suit for Partition & Injunction -> 4. Preliminary decree -> 5. Final decree with court commissioner partition.",
        "outcomes": ["Declaration of rightful share in joint family property", "Permanent injunction restraining unauthorized alienation", "Correction of Bhoomi RTC and mutation entries"]
    },
    "arrest rights": {
        "title": "Fundamental Rights of an Arrested Person (D.K. Basu Guidelines)",
        "rights": [
            "Right to know the grounds of arrest and whether offence is bailable (Sec 50 CrPC / BNSS)",
            "Right to have a family member or friend informed immediately upon arrest",
            "Right to consult and be defended by a legal practitioner of choice",
            "Right to free legal representation from DLSA if unable to afford a private lawyer",
            "Right to medical examination by a registered medical practitioner every 48 hours",
            "Right to be produced before the nearest Judicial Magistrate within 24 hours of arrest"
        ],
        "laws": ["Constitution of India (Articles 20, 21, 22)", "Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC", "Supreme Court D.K. Basu Guidelines"],
        "documents": ["Arrest Memo signed by police officer and independent witness", "Inspection Memo detailing physical body condition", "Case Diary / FIR copy (Crime Details Form)"],
        "authority": "Jurisdictional Magistrate, DLSA Remand Advocate, State Human Rights Commission (KSHRC)",
        "timeLimit": "Production before Magistrate strictly within 24 hours of physical apprehension (excluding travel time).",
        "process": "1. Demand entry in General Diary (GD) -> 2. Inspect arrest memo -> 3. Contact family & advocate -> 4. Present before Magistrate for bail argument -> 5. Apply for regular or anticipatory bail.",
        "outcomes": ["Immediate release on bail if bailable offence", "Court rejection of unlawful police custody", "Medical attention and documentation of any custodial torture"]
    },
    "maternity benefits": {
        "title": "Maternity Leave & Workplace Benefits",
        "rights": [
            "Right to 26 weeks (182 days) paid maternity leave for up to two surviving children",
            "Right to crèche facility in establishments employing 50 or more employees",
            "Protection against dismissal, discharge, or disadvantageous alteration of service during maternity leave",
            "Right to work from home if the nature of work allows, after statutory leave period",
            "Right to medical bonus if no prenatal and postnatal care is provided by employer"
        ],
        "laws": ["Maternity Benefit Act, 1961 (Amended 2017)", "Karnataka Maternity Benefit Rules", "Employees' State Insurance (ESI) Act, 1948"],
        "documents": ["Employment proof / Offer letter", "Medical certificate / pregnancy certificate from registered medical practitioner", "Formal written application for maternity leave notice to employer", "Child birth certificate after delivery"],
        "authority": "Inspector under Maternity Benefit Act / Karnataka Labour Commissionerate / DLSA",
        "timeLimit": "Notice of maternity leave: at least 7 weeks prior to expected delivery date. Wage claim: within 1 year.",
        "process": "1. Submit maternity notice with doctor certificate to HR -> 2. Employer sanctions 26-week paid leave -> 3. If denied, file complaint before Labour Inspector -> 4. Order directing full payment with penalty.",
        "outcomes": ["Full statutory salary payout for 26 weeks", "Reinstatement in service if wrongfully terminated", "Penalty of imprisonment and fine on defaulting employer"]
    },
    "senior citizen rights": {
        "title": "Senior Citizen Welfare & Maintenance Rights",
        "rights": [
            "Right to claim monthly maintenance (up to ₹10,000+) from adult children / legal heirs",
            "Right to revoke gift deeds or property transfers if children fail to provide basic maintenance",
            "Right to expedited priority hearing in all civil and revenue court proceedings",
            "Right to dedicated geriatric medical care and protection in state healthcare facilities"
        ],
        "laws": ["Maintenance and Welfare of Parents and Senior Citizens Act, 2007", "Karnataka Senior Citizens Rules"],
        "documents": ["Age Proof (Aadhaar Card / Senior Citizen Card showing 60+ years)", "Proof of relationship with children / heirs", "Copy of transferred property gift deed (if seeking cancellation)", "Bank statements showing medical expenses and lack of income"],
        "authority": "Senior Citizen Maintenance Tribunal (headed by Assistant Commissioner / Sub-Divisional Magistrate)",
        "timeLimit": "Tribunal is statutorily mandated to dispose of application within 90 days of notice service.",
        "process": "1. File simple petition before AC / SDM Maintenance Tribunal -> 2. Notice to children -> 3. Conciliation session -> 4. Order for monthly maintenance / property deed cancellation.",
        "outcomes": ["Mandatory monthly maintenance allowance deducted from children's salary", "Complete voiding and cancellation of property gift deeds under Section 23", "Eviction of abusive relatives from senior citizen's residence"]
    },
    "motor vehicle accidents": {
        "title": "Motor Vehicle Accident (MACT) Claims & Compensation",
        "rights": [
            "Right to file compensation claim before Motor Accident Claims Tribunal (MACT) without court fees",
            "Right to cashless emergency treatment up to ₹1.5 Lakhs during the golden hour",
            "Right to compensation for loss of income, disability, medical treatment, and pain/suffering",
            "No-Fault Liability compensation under Section 164 of Motor Vehicles Act (₹5 Lakhs for death, ₹2.5 Lakhs for grievous hurt)"
        ],
        "laws": ["Motor Vehicles (Amendment) Act, 2019", "Karnataka Motor Vehicles Rules", "Supreme Court MACT Guidelines"],
        "documents": ["FIR & Police Charge Sheet (Detailed Accident Report - DAR)", "Motor Vehicle Inspection (IMV) Report", "Medical records, discharge summary, and Disability Certificate from Medical Board", "Income Proof (ITR / Pay Slip) of victim / deceased", "Vehicle RC, Insurance Policy copy, and Driving License"],
        "authority": "Motor Accident Claims Tribunal (MACT) at District Court, Lok Adalat Karnataka",
        "timeLimit": "Must be filed within 6 months of occurrence of accident (Sec 166(3) MV Amendment Act 2019).",
        "process": "1. Police submits Detailed Accident Report (DAR) to Tribunal within 90 days -> 2. Insurer offers settlement -> 3. Lok Adalat settlement OR trial on quantum -> 4. Award deposited directly in bank.",
        "outcomes": ["Full compensation for loss of future dependency and income", "100% reimbursement of hospital & rehabilitation bills", "Compensation for loss of consortium and funeral expenses"]
    }
}
