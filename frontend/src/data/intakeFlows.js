/**
 * Guided Legal Intake question flows per legal category.
 * Each category maps to an array of step objects that the IntakeWizard renders sequentially.
 */

export const intakeCategories = [
  { id: 'consumer', label: 'Consumer Issue', icon: 'ShoppingBag', desc: 'Product defects, refunds, service complaints' },
  { id: 'property', label: 'Property Dispute', icon: 'Home', desc: 'Land disputes, encroachment, title issues' },
  { id: 'family', label: 'Family Law', icon: 'Users', desc: 'Divorce, custody, maintenance, domestic issues' },
  { id: 'criminal', label: 'Criminal Matter', icon: 'AlertTriangle', desc: 'FIR, bail, theft, assault, fraud' },
  { id: 'labour', label: 'Labour & Employment', icon: 'Briefcase', desc: 'Wages, termination, workplace harassment' },
  { id: 'cyber', label: 'Cyber Crime', icon: 'Monitor', desc: 'Online fraud, hacking, identity theft, harassment' },
  { id: 'domestic_violence', label: 'Domestic Violence', icon: 'ShieldAlert', desc: 'Physical, emotional, or economic abuse' },
  { id: 'senior_citizen', label: 'Senior Citizen', icon: 'Heart', desc: 'Elder abuse, maintenance, property rights' },
  { id: 'traffic', label: 'Traffic & Motor Vehicle', icon: 'Car', desc: 'Accidents, challans, insurance claims' },
  { id: 'tenant', label: 'Tenant / Landlord', icon: 'Building2', desc: 'Eviction, rent disputes, deposit issues' },
  { id: 'employment', label: 'Employment Issue', icon: 'UserCheck', desc: 'Wrongful termination, discrimination, PF/ESI' },
  { id: 'banking', label: 'Banking & Financial Fraud', icon: 'CreditCard', desc: 'Bank fraud, loan issues, insurance disputes' },
];

export const intakeFlows = {
  consumer: [
    { id: 'purchase_type', question: 'What type of purchase was this?', type: 'select', options: ['Online Purchase', 'Offline / In-Store Purchase', 'Service (Repair, Installation, etc.)', 'Subscription / Membership'], required: true },
    { id: 'issue_type', question: 'What is the main issue?', type: 'select', options: ['Defective Product', 'Refund Refused', 'Delivery Not Received', 'Wrong Item Received', 'Overcharging', 'Warranty Not Honored', 'Misleading Advertisement', 'Poor Service Quality', 'Other'], required: true },
    { id: 'amount', question: 'What is the approximate amount involved?', type: 'number', placeholder: 'Amount in Rupees', required: true, helpText: 'Enter the total amount you paid or are disputing' },
    { id: 'date_of_purchase', question: 'When did you make the purchase?', type: 'date', required: true },
    { id: 'seller_name', question: 'Name of the seller or company', type: 'text', placeholder: 'e.g., Amazon, Flipkart, Local Shop Name', required: true },
    { id: 'complaint_made', question: 'Have you already complained to the seller?', type: 'radio', options: ['Yes, but no response', 'Yes, they refused', 'No, I have not complained yet'], required: true },
    { id: 'description', question: 'Describe your issue in detail', type: 'textarea', placeholder: 'Explain what happened, when it happened, and what resolution you are seeking...', required: true },
    { id: 'evidence', question: 'Upload any supporting documents (invoice, screenshots, etc.)', type: 'file', required: false, helpText: 'PDF, JPG, PNG — max 5 MB each' },
  ],

  property: [
    { id: 'dispute_type', question: 'What type of property issue is this?', type: 'select', options: ['Land Encroachment', 'Title / Ownership Dispute', 'Boundary Dispute', 'Illegal Construction', 'Property Registration Issue', 'Inheritance / Partition', 'Tenant Eviction', 'Government Land Issue', 'Other'], required: true },
    { id: 'property_type', question: 'Type of property', type: 'select', options: ['Agricultural Land', 'Residential Plot', 'Residential Building/Flat', 'Commercial Property', 'Government Land', 'Other'], required: true },
    { id: 'location', question: 'Where is the property located?', type: 'text', placeholder: 'District, Taluk, Village/City', required: true },
    { id: 'survey_number', question: 'Survey number (if known)', type: 'text', placeholder: 'e.g., Sy. No. 123/4', required: false },
    { id: 'opposing_party', question: 'Who is the opposing party?', type: 'text', placeholder: 'Name of person, company, or government body', required: true },
    { id: 'description', question: 'Describe the dispute in detail', type: 'textarea', placeholder: 'Explain the situation, when it started, and what you want...', required: true },
    { id: 'evidence', question: 'Upload documents (sale deed, RTC, survey map, etc.)', type: 'file', required: false },
  ],

  family: [
    { id: 'issue_type', question: 'What family law issue are you facing?', type: 'select', options: ['Divorce', 'Child Custody', 'Maintenance / Alimony', 'Domestic Violence', 'Dowry Harassment', 'Marriage Registration', 'Adoption', 'Succession / Inheritance', 'Other'], required: true },
    { id: 'marriage_date', question: 'Date of marriage (if applicable)', type: 'date', required: false },
    { id: 'children', question: 'Are there children involved?', type: 'radio', options: ['Yes', 'No'], required: true },
    { id: 'legal_action_taken', question: 'Has any legal action been taken so far?', type: 'radio', options: ['No action taken', 'Police complaint filed', 'Court case pending', 'Mediation attempted'], required: true },
    { id: 'description', question: 'Describe your situation in detail', type: 'textarea', placeholder: 'Please share details about your situation...', required: true },
    { id: 'evidence', question: 'Upload supporting documents', type: 'file', required: false },
  ],

  criminal: [
    { id: 'crime_type', question: 'What type of criminal matter is this?', type: 'select', options: ['Theft / Robbery', 'Assault / Physical Violence', 'Fraud / Cheating', 'Threats / Intimidation', 'Murder / Attempt', 'Kidnapping', 'Sexual Offence', 'Forgery', 'Property Crime', 'Other'], required: true },
    { id: 'fir_filed', question: 'Has an FIR been filed?', type: 'radio', options: ['Yes', 'No, police refused', 'No, I have not tried yet'], required: true },
    { id: 'incident_date', question: 'When did the incident occur?', type: 'date', required: true },
    { id: 'incident_location', question: 'Where did the incident occur?', type: 'text', placeholder: 'Location / Area / Police Station jurisdiction', required: true },
    { id: 'accused_known', question: 'Do you know the accused?', type: 'radio', options: ['Yes, known person', 'No, unknown person'], required: true },
    { id: 'description', question: 'Describe the incident in detail', type: 'textarea', placeholder: 'What happened, who was involved, any witnesses...', required: true },
    { id: 'evidence', question: 'Upload evidence (photos, medical reports, etc.)', type: 'file', required: false },
  ],

  labour: [
    { id: 'issue_type', question: 'What is your employment issue?', type: 'select', options: ['Unpaid Wages / Salary', 'Wrongful Termination', 'Workplace Harassment', 'Denial of Benefits (PF, ESI)', 'Unsafe Working Conditions', 'Discrimination', 'Contract Violation', 'Other'], required: true },
    { id: 'employment_type', question: 'Type of employment', type: 'select', options: ['Permanent Employee', 'Contract Worker', 'Daily Wage Worker', 'Part-Time', 'Self-Employed / Freelancer'], required: true },
    { id: 'employer_name', question: 'Name of employer or company', type: 'text', placeholder: 'Company name', required: true },
    { id: 'duration', question: 'How long have you worked there?', type: 'text', placeholder: 'e.g., 2 years 3 months', required: true },
    { id: 'amount_due', question: 'Amount due (if wages issue)', type: 'number', placeholder: 'Amount in Rupees', required: false },
    { id: 'description', question: 'Describe your issue', type: 'textarea', placeholder: 'Explain the situation...', required: true },
    { id: 'evidence', question: 'Upload documents (appointment letter, salary slips, etc.)', type: 'file', required: false },
  ],

  cyber: [
    { id: 'crime_type', question: 'What type of cyber issue?', type: 'select', options: ['Online Financial Fraud', 'Hacking / Unauthorized Access', 'Identity Theft', 'Cyberstalking / Harassment', 'Phishing / Scam', 'Social Media Abuse', 'Data Breach', 'Online Defamation', 'Other'], required: true },
    { id: 'platform', question: 'Which platform or service was involved?', type: 'text', placeholder: 'e.g., WhatsApp, Facebook, Bank Website, UPI App', required: true },
    { id: 'financial_loss', question: 'Was there a financial loss?', type: 'radio', options: ['Yes', 'No'], required: true },
    { id: 'amount_lost', question: 'Amount lost (if applicable)', type: 'number', placeholder: 'Amount in Rupees', required: false },
    { id: 'incident_date', question: 'When did this happen?', type: 'date', required: true },
    { id: 'reported', question: 'Have you reported this already?', type: 'radio', options: ['Yes, to Cyber Crime portal', 'Yes, to Police', 'Yes, to Bank/Platform', 'No'], required: true },
    { id: 'description', question: 'Describe what happened', type: 'textarea', placeholder: 'Provide all details including screenshots if possible...', required: true },
    { id: 'evidence', question: 'Upload evidence (screenshots, transaction IDs, etc.)', type: 'file', required: false },
  ],

  domestic_violence: [
    { id: 'relation', question: 'Relationship with the person causing violence', type: 'select', options: ['Spouse / Partner', 'In-Laws', 'Parent', 'Sibling', 'Other Family Member', 'Live-in Partner'], required: true },
    { id: 'violence_type', question: 'Type of violence experienced', type: 'select', options: ['Physical Violence', 'Emotional / Verbal Abuse', 'Economic Abuse (withholding money)', 'Sexual Violence', 'Dowry Demands', 'Multiple Types'], required: true },
    { id: 'is_ongoing', question: 'Is this currently ongoing?', type: 'radio', options: ['Yes, happening now', 'Yes, it is recurring', 'No, it happened in the past'], required: true },
    { id: 'children_affected', question: 'Are children involved or affected?', type: 'radio', options: ['Yes', 'No', 'Not applicable'], required: true },
    { id: 'safe_now', question: 'Are you in a safe location right now?', type: 'radio', options: ['Yes', 'No — I need immediate help'], required: true },
    { id: 'description', question: 'Describe your situation (as much as you are comfortable sharing)', type: 'textarea', placeholder: 'Your information is confidential...', required: true },
    { id: 'evidence', question: 'Upload any evidence (photos, medical reports)', type: 'file', required: false },
  ],

  senior_citizen: [
    { id: 'issue_type', question: 'What issue are you facing?', type: 'select', options: ['Neglect by Family', 'Physical Abuse', 'Property Taken Away', 'Denied Maintenance', 'Abandonment', 'Financial Exploitation', 'Other'], required: true },
    { id: 'age', question: 'Age of the senior citizen', type: 'number', placeholder: 'Age in years', required: true },
    { id: 'living_situation', question: 'Current living situation', type: 'select', options: ['Living Alone', 'With Family', 'In Old Age Home', 'With Caretaker', 'Other'], required: true },
    { id: 'description', question: 'Describe the situation', type: 'textarea', placeholder: 'Explain what is happening...', required: true },
    { id: 'evidence', question: 'Upload any supporting documents', type: 'file', required: false },
  ],

  traffic: [
    { id: 'issue_type', question: 'What is the traffic-related issue?', type: 'select', options: ['Road Accident', 'Hit and Run', 'Challan / Fine Dispute', 'Insurance Claim Denied', 'License Issue', 'Vehicle Seizure', 'Other'], required: true },
    { id: 'incident_date', question: 'Date of incident', type: 'date', required: true },
    { id: 'vehicle_type', question: 'Type of vehicle involved', type: 'select', options: ['Two Wheeler', 'Car', 'Auto Rickshaw', 'Bus', 'Truck', 'Pedestrian', 'Other'], required: true },
    { id: 'injuries', question: 'Were there any injuries?', type: 'radio', options: ['Yes, serious injuries', 'Yes, minor injuries', 'No injuries', 'Fatal'], required: true },
    { id: 'fir_filed', question: 'Has an FIR / MLC been filed?', type: 'radio', options: ['Yes', 'No'], required: true },
    { id: 'description', question: 'Describe what happened', type: 'textarea', placeholder: 'Details of the incident...', required: true },
    { id: 'evidence', question: 'Upload documents (photos, FIR copy, medical reports)', type: 'file', required: false },
  ],

  tenant: [
    { id: 'role', question: 'Are you the tenant or the landlord?', type: 'radio', options: ['Tenant', 'Landlord'], required: true },
    { id: 'issue_type', question: 'What is the issue?', type: 'select', options: ['Eviction Notice', 'Rent Increase Dispute', 'Security Deposit Not Returned', 'Maintenance Issues', 'Illegal Lock-Out', 'Lease Agreement Dispute', 'Subletting Issue', 'Other'], required: true },
    { id: 'rent_amount', question: 'Monthly rent amount', type: 'number', placeholder: 'Amount in Rupees', required: true },
    { id: 'agreement_exists', question: 'Is there a written rental agreement?', type: 'radio', options: ['Yes', 'No'], required: true },
    { id: 'description', question: 'Describe your situation', type: 'textarea', placeholder: 'Explain the dispute...', required: true },
    { id: 'evidence', question: 'Upload documents (agreement, receipts, notices)', type: 'file', required: false },
  ],

  employment: [
    { id: 'issue_type', question: 'What employment issue are you facing?', type: 'select', options: ['Wrongful Termination', 'Sexual Harassment at Workplace', 'Discrimination', 'Non-Payment of Dues', 'PF / ESI Issues', 'Non-Compete Clause', 'Contract Dispute', 'Other'], required: true },
    { id: 'sector', question: 'Employment sector', type: 'select', options: ['Private Sector', 'Government / Public Sector', 'IT / Software', 'Manufacturing', 'Retail / Hospitality', 'Healthcare', 'Education', 'Other'], required: true },
    { id: 'employer_name', question: 'Employer name', type: 'text', placeholder: 'Company / Organization name', required: true },
    { id: 'employment_duration', question: 'How long did you work there?', type: 'text', placeholder: 'e.g., 3 years', required: true },
    { id: 'description', question: 'Describe the issue', type: 'textarea', placeholder: 'Explain what happened...', required: true },
    { id: 'evidence', question: 'Upload documents', type: 'file', required: false },
  ],

  banking: [
    { id: 'issue_type', question: 'What type of banking/financial issue?', type: 'select', options: ['Unauthorized Transaction', 'Loan Fraud', 'Credit Card Fraud', 'Insurance Claim Rejected', 'Bank Account Frozen', 'Cheque Bounce (Section 138)', 'EMI / Recovery Agent Harassment', 'KYC Issue', 'Other'], required: true },
    { id: 'bank_name', question: 'Name of bank or financial institution', type: 'text', placeholder: 'Bank / NBFC / Insurance company name', required: true },
    { id: 'amount_involved', question: 'Amount involved', type: 'number', placeholder: 'Amount in Rupees', required: true },
    { id: 'incident_date', question: 'When did this happen?', type: 'date', required: true },
    { id: 'complaint_filed', question: 'Have you complained to the bank?', type: 'radio', options: ['Yes, no response', 'Yes, unsatisfactory response', 'Complained to Banking Ombudsman', 'No'], required: true },
    { id: 'description', question: 'Describe the issue', type: 'textarea', placeholder: 'Include transaction IDs, dates, and other details...', required: true },
    { id: 'evidence', question: 'Upload documents (bank statements, complaint receipts)', type: 'file', required: false },
  ],
};
