import {
  FileWarning, FileText, Scale, ShoppingBag, ShieldAlert, ScrollText,
  UserCheck, Building2, Home, Briefcase, Laptop, Gavel, BookOpen,
  Shield, ClipboardCheck, BadgeCheck, PenSquare, FileEdit, Clock, TriangleAlert
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'All', label: 'All Documents' },
  { id: 'Civil', label: 'Civil Law' },
  { id: 'Criminal', label: 'Criminal' },
  { id: 'Consumer', label: 'Consumer' },
  { id: 'Government', label: 'Government & RTI' },
  { id: 'Property', label: 'Property & Housing' },
  { id: 'General', label: 'General & Deeds' },
];

export const DOCUMENT_CATALOG = [
  // ── CIVIL ──
  {
    id: 'Complaint',
    title: 'Complaint',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: FileWarning,
    shortDesc: 'General complaint for civil disputes, property issues, and recovery of dues.',
    purpose: 'To initiate formal legal proceedings or lodge a grievance before competent civil authorities.',
    estimatedTime: '2 minutes',
    popular: true,
    useCases: [
      'Property & boundary disputes',
      'Breach of contract or agreement',
      'Recovery of monetary dues',
      'Civil nuisance or harassment'
    ],
    requiredInfo: ['Applicant Name', 'District', 'Opposite Party Name', 'Date of Incident', 'Facts of Case', 'Relief Sought'],
    questions: [
      { key: 'name', label: 'What is your full name (Applicant)?', placeholder: 'e.g. Ramesh Kumar' },
      { key: 'district', label: 'Which District in Karnataka are you filing in?', type: 'select' },
      { key: 'respondent', label: 'Who is the Opposite Party / Defendant?', placeholder: 'e.g. Suresh Rao / Bescom Dept' },
      { key: 'issueDate', label: 'When did the incident or cause of action occur?', type: 'date' },
      { key: 'facts', label: 'Describe the facts of your complaint in detail.', type: 'textarea', placeholder: 'Include dates, locations, events in chronological order...' },
      { key: 'relief', label: 'What specific relief or action are you seeking?', type: 'textarea', placeholder: 'e.g. Direct opposite party to refund ₹50,000 and stop encroachment.' }
    ]
  },
  {
    id: 'Petition draft',
    title: 'Petition Draft',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: FileText,
    shortDesc: 'Formal petition draft for civil court prayer and judicial relief.',
    purpose: 'To submit a written prayer before a competent civil court or tribunal.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Submitting judicial prayers',
      'Misc civil applications',
      'Interlocutory petitions'
    ],
    requiredInfo: ['Petitioner Name', 'Court Name', 'Opposite Party', 'Facts', 'Prayer / Relief'],
    questions: [
      { key: 'name', label: 'Full name of the Petitioner?', placeholder: 'e.g. Manjunath Gowda' },
      { key: 'district', label: 'Select Jurisdiction District', type: 'select' },
      { key: 'respondent', label: 'Respondent Name / Authority', placeholder: 'e.g. Municipal Corporation' },
      { key: 'issueDate', label: 'Date of Petition', type: 'date' },
      { key: 'facts', label: 'State the grounds and facts of the petition', type: 'textarea' },
      { key: 'relief', label: 'Specific prayer / relief sought from court', type: 'textarea' }
    ]
  },
  {
    id: 'Written Statement',
    title: 'Written Statement',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: FileEdit,
    shortDesc: 'Defense reply to a civil suit complaint denying false allegations.',
    purpose: 'To file a formal written defense statement in response to a plaintiff\'s suit.',
    estimatedTime: '3 minutes',
    popular: false,
    useCases: [
      'Replying to civil suit summons',
      'Denying false allegations',
      'Submitting counter-claims'
    ],
    requiredInfo: ['Defendant Name', 'Plaintiff Name', 'Court Name & Case No.', 'Parawise Reply'],
    questions: [
      { key: 'name', label: 'Full name of Defendant / Respondent?', placeholder: 'e.g. Sunitha Devi' },
      { key: 'district', label: 'Select District Court', type: 'select' },
      { key: 'respondent', label: 'Plaintiff Name', placeholder: 'e.g. Anand Rao' },
      { key: 'issueDate', label: 'Date of Reply', type: 'date' },
      { key: 'facts', label: 'Defense statement & parawise reply to allegations', type: 'textarea' },
      { key: 'relief', label: 'Dismissal prayer / costs requested', type: 'textarea' }
    ]
  },
  {
    id: 'Appeal',
    title: 'Appeal',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: Gavel,
    shortDesc: 'Formal memorandum of appeal against a lower court decree or order.',
    purpose: 'To challenge an adverse decree or order before an appellate court.',
    estimatedTime: '3 minutes',
    popular: false,
    useCases: [
      'Challenging District Court judgments',
      'First Appeal / Second Appeal',
      'Submitting grounds of legal error'
    ],
    requiredInfo: ['Appellant Name', 'Respondent Name', 'Lower Court Name', 'Impugned Order Date', 'Grounds of Appeal'],
    questions: [
      { key: 'name', label: 'Appellant Name', placeholder: 'e.g. Venkatesh Murthy' },
      { key: 'district', label: 'Appellate District', type: 'select' },
      { key: 'respondent', label: 'Respondent Name', placeholder: 'e.g. State of Karnataka & Ors.' },
      { key: 'issueDate', label: 'Date of Lower Court Order', type: 'date' },
      { key: 'facts', label: 'Background of lower court judgment', type: 'textarea' },
      { key: 'relief', label: 'Grounds of appeal & prayer to set aside order', type: 'textarea' }
    ]
  },
  {
    id: 'Revision Petition',
    title: 'Revision Petition',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: BookOpen,
    shortDesc: 'Revision petition for correcting lower court jurisdictional or procedural errors.',
    purpose: 'To invoke revisional jurisdiction of a higher court.',
    estimatedTime: '3 minutes',
    popular: false,
    useCases: [
      'Correcting jurisdictional errors',
      'Procedural irregularity revision',
      'High Court Section 115 CPC revision'
    ],
    requiredInfo: ['Revision Petitioner', 'Respondent', 'Lower Court Name', 'Revision Grounds'],
    questions: [
      { key: 'name', label: 'Petitioner Name', placeholder: 'e.g. Lakshmi Bai' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Respondent Name', placeholder: 'e.g. BDA Authority' },
      { key: 'issueDate', label: 'Date of impugned order', type: 'date' },
      { key: 'facts', label: 'Facts showing jurisdictional error', type: 'textarea' },
      { key: 'relief', label: 'Revisional relief sought', type: 'textarea' }
    ]
  },
  {
    id: 'Interim Relief',
    title: 'Interim Relief',
    category: 'Civil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: Shield,
    shortDesc: 'Application for temporary injunction or stay order during pending case.',
    purpose: 'To seek immediate temporary protection or stay order to preserve status quo.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Property demolition stay order',
      'Restraining opposite party from selling land',
      'Emergency status quo order'
    ],
    requiredInfo: ['Applicant Name', 'Opposite Party', 'Urgency Facts', 'Temporary Relief Needed'],
    questions: [
      { key: 'name', label: 'Applicant Name', placeholder: 'e.g. Kavitha Hegde' },
      { key: 'district', label: 'Court District', type: 'select' },
      { key: 'respondent', label: 'Opposite Party Name', placeholder: 'e.g. Private Builder' },
      { key: 'issueDate', label: 'Date of Threat / Urgency', type: 'date' },
      { key: 'facts', label: 'Urgent facts justifying interim stay', type: 'textarea' },
      { key: 'relief', label: 'Exact interim injunction prayed for', type: 'textarea' }
    ]
  },

  // ── CRIMINAL ──
  {
    id: 'Police Complaint',
    title: 'Police Complaint',
    category: 'Criminal',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: ShieldAlert,
    shortDesc: 'Formal complaint to Station House Officer (SHO) for FIR registration.',
    purpose: 'To report a cognizable offense to the police for investigation.',
    estimatedTime: '2 minutes',
    popular: true,
    useCases: [
      'Theft, burglary, & robbery',
      'Physical assault & criminal intimidation',
      'Cheating, forgery & financial fraud',
      'Trespass & property damage'
    ],
    requiredInfo: ['Complainant Name', 'Police Station District', 'Accused Details', 'Incident Date & Place', 'Offense Description'],
    questions: [
      { key: 'name', label: 'Full name of Complainant?', placeholder: 'e.g. Vinay Kumar' },
      { key: 'district', label: 'Select Police Station District', type: 'select' },
      { key: 'respondent', label: 'Name / Description of Accused Person(s)', placeholder: 'e.g. Unknown persons / Named Accused' },
      { key: 'issueDate', label: 'Date & Time of Incident', type: 'date' },
      { key: 'facts', label: 'Describe the criminal incident in detail', type: 'textarea', placeholder: 'Mention exact location, time, weapons/threats used, witnesses...' },
      { key: 'relief', label: 'Action requested (FIR registration & arrest)', type: 'textarea' }
    ]
  },
  {
    id: 'Cyber Crime Complaint',
    title: 'Cyber Crime Complaint',
    category: 'Criminal',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: Laptop,
    shortDesc: 'Complaint for online financial fraud, UPI scam, hacking, or online abuse.',
    purpose: 'To report cyber crimes to the Cyber Crime Police Cell & National Cyber Portal.',
    estimatedTime: '2 minutes',
    popular: true,
    useCases: [
      'UPI / Bank OTP / Credit Card Fraud',
      'Social media fake profiles & harassment',
      'Phishing, malware & ransomware attacks',
      'Online shopping fraud'
    ],
    requiredInfo: ['Complainant Name', 'District Cyber Cell', 'Scammer Number / URL', 'Date of Fraud', 'Loss Amount & Facts'],
    questions: [
      { key: 'name', label: 'Complainant Full Name', placeholder: 'e.g. Swathi Rao' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Scammer Phone No / Account / Website URL', placeholder: 'e.g. Fraudulent UPI ID / Phone 98765xxxx' },
      { key: 'issueDate', label: 'Date of Fraudulent Transaction', type: 'date' },
      { key: 'facts', label: 'Describe how the online fraud took place', type: 'textarea', placeholder: 'Include transaction IDs, bank name, fraudulent links clicked...' },
      { key: 'relief', label: 'Request to block scammer account & refund money', type: 'textarea' }
    ]
  },

  // ── CONSUMER ──
  {
    id: 'Consumer Complaint',
    title: 'Consumer Complaint',
    category: 'Consumer',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    icon: ShoppingBag,
    shortDesc: 'Complaint before District Consumer Commission for defective products or services.',
    purpose: 'To seek refund, replacement, or compensation under Consumer Protection Act 2019.',
    estimatedTime: '2 minutes',
    popular: true,
    useCases: [
      'Defective electronic appliances or vehicles',
      'Deficiency in telecom, banking, or medical service',
      'E-commerce non-delivery or refusal of refund',
      'Builder delay in flat possession'
    ],
    requiredInfo: ['Consumer Name', 'Seller / Brand Name', 'Purchase Date & Amount', 'Defect Details', 'Compensation Sought'],
    questions: [
      { key: 'name', label: 'Consumer / Purchaser Name', placeholder: 'e.g. Prakash Shetty' },
      { key: 'district', label: 'District Consumer Forum Location', type: 'select' },
      { key: 'respondent', label: 'Opposite Party (Company / Seller Name)', placeholder: 'e.g. XYZ Electronics Ltd.' },
      { key: 'issueDate', label: 'Date of Purchase / Invoice', type: 'date' },
      { key: 'facts', label: 'Details of product defect or service deficiency', type: 'textarea' },
      { key: 'relief', label: 'Refund amount + compensation claimed', type: 'textarea', placeholder: 'e.g. Full refund of ₹35,000 plus ₹10,000 compensation for harassment.' }
    ]
  },

  // ── GOVERNMENT ──
  {
    id: 'RTI Application',
    title: 'RTI Application',
    category: 'Government',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: Building2,
    shortDesc: 'Right to Information query to Public Information Officer (PIO).',
    purpose: 'To seek certified official records and public information under RTI Act 2005.',
    estimatedTime: '1.5 minutes',
    popular: true,
    useCases: [
      'Checking status of pending government applications',
      'Requesting land survey or revenue records',
      'Inspecting municipal road & drainage expenditure',
      'Verification of recruitment / exam records'
    ],
    requiredInfo: ['Applicant Name', 'Public Authority Name & Address', 'Specific Information Queries', 'Period of Records'],
    questions: [
      { key: 'name', label: 'Applicant Full Name', placeholder: 'e.g. Guruprasad K' },
      { key: 'district', label: 'District of Public Authority', type: 'select' },
      { key: 'respondent', label: 'Public Information Officer (PIO) / Department', placeholder: 'e.g. PIO, BBMP / Tahsildar Office' },
      { key: 'issueDate', label: 'Date of Application', type: 'date' },
      { key: 'facts', label: 'List the specific information / certified documents requested', type: 'textarea', placeholder: 'Point 1: Provide certified copy of...\nPoint 2: Provide status of file no...' },
      { key: 'relief', label: 'Inspection / Certified copy request', type: 'textarea', placeholder: 'Requesting certified copies to be sent by speed post.' }
    ]
  },
  {
    id: 'Legal aid application',
    title: 'Legal Aid Application',
    category: 'Government',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: FileText,
    shortDesc: 'Application for free advocate assignment via District Legal Services Authority.',
    purpose: 'To apply for free legal representation under Legal Services Authorities Act 1987.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Free lawyer for citizens with annual income below ₹3 Lakhs',
      'Women, SC/ST, & senior citizen free legal aid',
      'Court fee & legal expense exemption'
    ],
    requiredInfo: ['Applicant Name', 'District DLSA Office', 'Annual Income & Category', 'Grievance Summary'],
    questions: [
      { key: 'name', label: 'Applicant Name', placeholder: 'e.g. Parvathamma' },
      { key: 'district', label: 'District Legal Services Authority', type: 'select' },
      { key: 'respondent', label: 'Opposite Party in Court Case', placeholder: 'e.g. Private Party / Landlord' },
      { key: 'issueDate', label: 'Date of Application', type: 'date' },
      { key: 'facts', label: 'Brief description of your legal case & eligibility category (Income/SC/ST/Woman)', type: 'textarea' },
      { key: 'relief', label: 'Request for free panel advocate & court fee assistance', type: 'textarea' }
    ]
  },

  // ── PROPERTY ──
  {
    id: 'Rental Agreement',
    title: 'Rental Agreement',
    category: 'Property',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: Home,
    shortDesc: 'Residential or commercial 11-month lease agreement draft.',
    purpose: 'To formalize tenancy terms, rent amount, deposit, and landlord-tenant covenants.',
    estimatedTime: '3 minutes',
    popular: true,
    useCases: [
      '11-month house / flat rental contract',
      'Commercial shop & office space lease',
      'Paying Guest (PG) accommodation agreement'
    ],
    requiredInfo: ['Landlord Name', 'Tenant Name', 'Property Address', 'Monthly Rent', 'Security Deposit', 'Lease Term'],
    questions: [
      { key: 'name', label: 'Landlord / Lessor Full Name', placeholder: 'e.g. Natesh Hegde' },
      { key: 'district', label: 'Property District', type: 'select' },
      { key: 'respondent', label: 'Tenant / Lessee Full Name', placeholder: 'e.g. Aditya Sharma' },
      { key: 'issueDate', label: 'Lease Start Date', type: 'date' },
      { key: 'facts', label: 'Property Address, Monthly Rent (₹), Security Deposit (₹), and Maintenance terms', type: 'textarea', placeholder: 'Property: Flat 302, Green Acres...\nRent: ₹20,000/month\nDeposit: ₹1,50,000' },
      { key: 'relief', label: 'Terms on notice period, lock-in period, & renewal', type: 'textarea' }
    ]
  },
  {
    id: 'Power of Attorney',
    title: 'Power of Attorney',
    category: 'Property',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: UserCheck,
    shortDesc: 'General or Special Power of Attorney authorizing a legal agent.',
    purpose: 'To empower an agent to act on behalf of the principal in property/legal matters.',
    estimatedTime: '2.5 minutes',
    popular: false,
    useCases: [
      'Authorizing family member to manage property',
      'NRI property sale / registration agent',
      'Court appearance & bank operations POA'
    ],
    requiredInfo: ['Principal Name', 'Attorney / Agent Name', 'Specific Authorized Acts', 'Property Details'],
    questions: [
      { key: 'name', label: 'Principal Full Name (Grantor)', placeholder: 'e.g. B. S. Rao' },
      { key: 'district', label: 'Execution District', type: 'select' },
      { key: 'respondent', label: 'Attorney / Agent Full Name', placeholder: 'e.g. Karthik Rao' },
      { key: 'issueDate', label: 'Execution Date', type: 'date' },
      { key: 'facts', label: 'Describe property & powers granted to Attorney', type: 'textarea', placeholder: 'To represent before Sub-Registrar, sign sale deeds, collect rent...' },
      { key: 'relief', label: 'Ratification clause & revocation terms', type: 'textarea' }
    ]
  },

  // ── GENERAL ──
  {
    id: 'Affidavit draft',
    title: 'Affidavit',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: ScrollText,
    shortDesc: 'Sworn statement of facts on stamp paper before an oath commissioner or notary.',
    purpose: 'To submit a legally binding sworn declaration under oath.',
    estimatedTime: '1.5 minutes',
    popular: true,
    useCases: [
      'Name change or spelling correction affidavit',
      'Address proof & missing document declaration',
      'Income & Caste verification declaration',
      'No-encumbrance property affidavit'
    ],
    requiredInfo: ['Deponent Name', 'Father / Husband Name', 'Address', 'Sworn Facts'],
    questions: [
      { key: 'name', label: 'Deponent Full Name', placeholder: 'e.g. Chethan Kumar' },
      { key: 'district', label: 'Execution District', type: 'select' },
      { key: 'respondent', label: 'Authority to submit affidavit to', placeholder: 'e.g. Revenue Officer / University' },
      { key: 'issueDate', label: 'Date of Affirmation', type: 'date' },
      { key: 'facts', label: 'State the specific facts you are solemnly affirming under oath', type: 'textarea', placeholder: 'I state that my correct name is Chethan Kumar and...' },
      { key: 'relief', label: 'Verification clause', type: 'textarea', placeholder: 'Verified that the contents of above affidavit are true and correct.' }
    ]
  },
  {
    id: 'Legal Notice',
    title: 'Legal Notice',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: Scale,
    shortDesc: 'Pre-litigation formal demand notice issuing 15-day compliance warning.',
    purpose: 'To formally demand compliance or settlement before initiating court litigation.',
    estimatedTime: '2 minutes',
    popular: true,
    useCases: [
      'Money recovery & cheque bounce (Sec 138 NI Act)',
      'Tenant eviction & rent default warning',
      'Breach of commercial contract',
      'Defamation & cease and desist'
    ],
    requiredInfo: ['Sender Name', 'Recipient Name & Address', 'Breach Facts', 'Demand Amount / Action', '15-Day Deadline'],
    questions: [
      { key: 'name', label: 'Sender Full Name (Client)', placeholder: 'e.g. Mahadevappa' },
      { key: 'district', label: 'Sender District', type: 'select' },
      { key: 'respondent', label: 'Recipient Name & Full Address', placeholder: 'e.g. Sharanappa, #42, MG Road...' },
      { key: 'issueDate', label: 'Notice Date', type: 'date' },
      { key: 'facts', label: 'Facts of grievance & breach committed by recipient', type: 'textarea' },
      { key: 'relief', label: 'Exact demand & 15-day compliance warning', type: 'textarea', placeholder: 'Demand payment of ₹1,00,000 within 15 days failing which suit will be filed.' }
    ]
  },
  {
    id: 'Reply Notice',
    title: 'Reply Notice',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: FileEdit,
    shortDesc: 'Formal reply to a legal notice denying false allegations.',
    purpose: 'To respond to a received legal notice and refute claims made against you.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Replying to false cheque bounce notice',
      'Refuting illegal eviction demand',
      'Denying contract breach allegations'
    ],
    requiredInfo: ['Respondent Name', 'Notice Sender Name', 'Notice Date', 'Denial Facts'],
    questions: [
      { key: 'name', label: 'Respondent Name (Replying Party)', placeholder: 'e.g. Sharada Patil' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Notice Sender Name', placeholder: 'e.g. ABC Finance Pvt Ltd' },
      { key: 'issueDate', label: 'Date of Received Legal Notice', type: 'date' },
      { key: 'facts', label: 'Facts refuting and denying the allegations in notice', type: 'textarea' },
      { key: 'relief', label: 'Demand to unconditionally withdraw notice', type: 'textarea' }
    ]
  },
  {
    id: 'Undertaking',
    title: 'Undertaking',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: ClipboardCheck,
    shortDesc: 'Formal written commitment or pledge submitted to an authority or court.',
    purpose: 'To submit a binding promise to fulfill specific legal conditions.',
    estimatedTime: '1.5 minutes',
    popular: false,
    useCases: [
      'Bail condition compliance undertaking',
      'Time extension pledge for document submission',
      'Building plan compliance undertaking'
    ],
    requiredInfo: ['Declarant Name', 'Authority / Court Name', 'Specific Promise'],
    questions: [
      { key: 'name', label: 'Declarant Name', placeholder: 'e.g. Nagaraj V' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Authority / Court Name', placeholder: 'e.g. Hon\'bleJMFC Court / BBMP' },
      { key: 'issueDate', label: 'Date of Undertaking', type: 'date' },
      { key: 'facts', label: 'Specific commitment / condition you undertake to fulfill', type: 'textarea' },
      { key: 'relief', label: 'Binding pledge clause', type: 'textarea' }
    ]
  },
  {
    id: 'Indemnity Bond',
    title: 'Indemnity Bond',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: BadgeCheck,
    shortDesc: 'Legal bond guaranteeing compensation against potential future financial loss.',
    purpose: 'To indemnify an institution against claims arising from asset release or duplicate documents.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Bank account claim without nominee',
      'Duplicate share certificate / fixed deposit',
      'Government provident fund settlement'
    ],
    requiredInfo: ['Indemnifier Name', 'Institution Name', 'Bond Amount', 'Indemnity Condition'],
    questions: [
      { key: 'name', label: 'Indemnifier Name', placeholder: 'e.g. Sridhar B' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Bank / Institution Name', placeholder: 'e.g. Canara Bank, Main Branch' },
      { key: 'issueDate', label: 'Date of Execution', type: 'date' },
      { key: 'facts', label: 'Amount & situation requiring indemnity protection', type: 'textarea' },
      { key: 'relief', label: 'Indemnity guarantee clause', type: 'textarea' }
    ]
  },
  {
    id: 'Vakalatnama placeholder',
    title: 'Vakalatnama',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: PenSquare,
    shortDesc: 'Advocate authorization deed for representing client in court cases.',
    purpose: 'To formally appoint and retain an advocate to plead before court.',
    estimatedTime: '1.5 minutes',
    popular: true,
    useCases: [
      'Authorizing advocate for civil suit',
      'Criminal defense lawyer authorization',
      'High Court & District Court Vakalatnama'
    ],
    requiredInfo: ['Client Name', 'Advocate Name', 'Enrollment Number', 'Court Name', 'Case Number'],
    questions: [
      { key: 'petitioner', label: 'Client / Petitioner Name', placeholder: 'e.g. Ramesh Kumar' },
      { key: 'respondent', label: 'Respondent / Defendant Name', placeholder: 'e.g. State of Karnataka' },
      { key: 'courtName', label: 'Court Name', placeholder: 'e.g. HIGH COURT OF KARNATAKA' },
      { key: 'caseNumber', label: 'Case Number (Optional)', placeholder: 'e.g. WP 12345/2026' },
      { key: 'advocateName', label: 'Advocate Name', placeholder: 'e.g. Srikanth Sharma, Advocate' },
      { key: 'enrollmentNumber', label: 'Advocate Enrollment Number', placeholder: 'e.g. KAR/1234/2015' },
      { key: 'officeAddress', label: 'Advocate Office Address', placeholder: 'e.g. #12, Chamber Block, High Court' },
      { key: 'clientAddress', label: 'Client Residential Address', placeholder: 'e.g. #45, Jayanagar, Bengaluru' },
      { key: 'place', label: 'Place', placeholder: 'Bengaluru' },
      { key: 'issueDate', label: 'Date', type: 'date' }
    ]
  },
  {
    id: 'Condonation of Delay',
    title: 'Condonation of Delay',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: Clock,
    shortDesc: 'Application under Section 5 Limitation Act for excusing filing delay.',
    purpose: 'To request court to condone delay in filing appeal or application.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Late appeal filing due to illness',
      'Delay in receiving lower court order copy',
      'Unavoidable emergency limitation delay'
    ],
    requiredInfo: ['Applicant Name', 'Court Name', 'Number of Days Delayed', 'Sufficient Cause'],
    questions: [
      { key: 'name', label: 'Applicant Name', placeholder: 'e.g. Mohan Das' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Opposite Party Name', placeholder: 'e.g. Insurance Company' },
      { key: 'issueDate', label: 'Date of Application', type: 'date' },
      { key: 'facts', label: 'Explain sufficient cause for delay (medical/order copy delay)', type: 'textarea' },
      { key: 'relief', label: 'Prayer to condone delay of X days', type: 'textarea' }
    ]
  },
  {
    id: 'Caveat Petition',
    title: 'Caveat Petition',
    category: 'General',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    icon: TriangleAlert,
    shortDesc: 'Caveat lodged under Sec 148A CPC ensuring notice before any stay order.',
    purpose: 'To ensure no ex-parte interim order is passed without hearing the caveator.',
    estimatedTime: '2 minutes',
    popular: false,
    useCases: [
      'Preventing surprise stay orders against property',
      'Right to notice before ex-parte injunction'
    ],
    requiredInfo: ['Caveator Name', 'Expected Opposing Party', 'Court Name', 'Subject Matter'],
    questions: [
      { key: 'name', label: 'Caveator Name', placeholder: 'e.g. Divya Prakash' },
      { key: 'district', label: 'Select District', type: 'select' },
      { key: 'respondent', label: 'Expected Opposing Party (Caveatee)', placeholder: 'e.g. Local Municipality' },
      { key: 'issueDate', label: 'Date of Caveat', type: 'date' },
      { key: 'facts', label: 'Subject matter of anticipated lawsuit / order', type: 'textarea' },
      { key: 'relief', label: 'Prayer for prior notice before granting any order', type: 'textarea' }
    ]
  }
];
