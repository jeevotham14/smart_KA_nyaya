/**
 * Smart Karnataka Nyaya — Distinct Legal Document Draft Generators
 * Specialized templates for all 24 supported legal document types.
 */

export const DOCUMENT_DRAFT_TEMPLATES = {
  // 1. Complaint
  Complaint: (answers) => `IN THE COURT OF THE PRINCIPAL CIVIL JUDGE
AT ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

COMPLAINT NO. _______ / 2026

${answers.name || '[COMPLAINANT NAME]'}
Residing at: ${answers.address || '[COMPLAINANT ADDRESS]'}, ${answers.district || '[DISTRICT]'}
... Complainant / Plaintiff

VERSUS

${answers.respondent || '[OPPOSITE PARTY / DEFENDANT NAME]'}
Residing / Located at: ${answers.respondentAddress || '[OPPOSITE PARTY ADDRESS]'}
... Opposite Party / Defendant

MEMORANDUM OF CIVIL COMPLAINT UNDER KARNATAKA CIVIL RULES OF PRACTICE

The Complainant above-named most respectfully submits as under:

1. JURISDICTION:
   The Complainant is residing at ${answers.district || '[DISTRICT]'} and the cause of action accrued within the territorial jurisdiction of this Hon'ble Court.

2. FACTS OF THE CASE:
   a) Incident / Transaction Date: ${answers.issueDate || '[DATE]'}
   b) ${answers.facts || '[Chronological description of facts, events, agreements, and grievances.]'}

3. CAUSE OF ACTION:
   The cause of action arose on ${answers.issueDate || '[DATE]'} when the Opposite Party failed/refused to fulfill their legal obligations despite repeated requests by the Complainant.

4. VALUATION & COURT FEES:
   The complaint is valued for the purpose of jurisdiction and court fees in accordance with the Karnataka Court Fees and Suits Valuation Act.

PRAYER / RELIEF SOUGHT:
In light of the facts stated above, the Complainant prays that this Hon'ble Court may be pleased to:
a) ${answers.relief || 'Direct the Opposite Party to fulfill their obligations and grant appropriate relief.'}
b) Award costs of this complaint to the Complainant.
c) Pass such other order(s) as this Hon'ble Court deems fit in the interest of justice and equity.

Place: ${answers.district || 'Bengaluru'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
Complainant Signature

VERIFICATION
I, ${answers.name || '[NAME]'}, do hereby declare that the contents of paragraphs 1 to 4 above are true and correct to the best of my knowledge, information, and belief.

_______________________
Deponent / Complainant`,

  // 2. Petition draft
  'Petition draft': (answers) => `BEFORE THE HON'BLE DISTRICT JUDGE
AT ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

PETITION NO. _______ / 2026

IN THE MATTER OF:
${answers.name || '[PETITIONER NAME]'}
... Petitioner

VERSUS

${answers.respondent || '[RESPONDENT / AUTHORITY NAME]'}
... Respondent

PETITION FILED UNDER APPLICABLE PROVISIONS OF CIVIL LAW

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is a law-abiding citizen of India residing within the jurisdiction of this Hon'ble Court at ${answers.district || '[DISTRICT]'}.

2. STATEMENTS OF FACTS:
   ${answers.facts || '[State chronological facts, relevant dates, documents, and grievances.]'}

3. GROUNDS FOR PETITION:
   a) The action of the Respondent is arbitrary and opposed to principles of natural justice.
   b) The Petitioner has a prima facie valid legal claim requiring judicial intervention.

PRAYER:
Wherefore, the Petitioner prays that this Hon'ble Court may kindly be pleased to:
a) ${answers.relief || 'Issue an appropriate order or direction granting the relief prayed for.'}
b) Grant such other relief as deemed just and proper.

Place: ${answers.district || 'Bengaluru'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
Petitioner Signature`,

  // 3. Legal aid application
  'Legal aid application': (answers) => `BEFORE THE SECRETARY, DISTRICT LEGAL SERVICES AUTHORITY (DLSA)
DISTRICT COURT COMPLEX, ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

APPLICATION FOR FREE LEGAL SERVICES / ADVOCATE ASSISTANCE
(Under Section 12 of the Legal Services Authorities Act, 1987)

1. Applicant Name: ${answers.name || '[APPLICANT NAME]'}
2. Address: ${answers.address || '[APPLICANT ADDRESS]'}, ${answers.district || '[DISTRICT]'}
3. Contact Number: ${answers.phone || '[CONTACT NUMBER]'}
4. Category of Applicant: ${answers.category || 'Low Income / SC / ST / Woman / Senior Citizen'}
5. Annual Household Income: ₹ ${answers.income || '[ANNUAL INCOME]'} (Below prescribed legal aid limit)

BRIEF DETAILS OF LEGAL DISPUTE:
Opposite Party: ${answers.respondent || '[OPPOSITE PARTY NAME]'}
Nature of Dispute: ${answers.facts || '[Briefly describe the legal case or dispute requiring legal aid advocate assistance.]'}

PRAYER:
I request the District Legal Services Authority to provide me with a free panel advocate and legal aid assistance to represent my case.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Applicant Signature`,

  // 4. Vakalatnama placeholder / Vakalatnama
  'Vakalatnama placeholder': (answers) => `IN THE COURT OF ${answers.courtName || 'THE HIGH COURT OF KARNATAKA'}
AT ${answers.place || 'BENGALURU'}

CASE / PETITION NO. ${answers.caseNumber || '_______ / 2026'}

${answers.petitioner || answers.name || '[PETITIONER / PLAINTIFF NAME]'}
... Petitioner / Plaintiff
VERSUS
${answers.respondent || '[RESPONDENT / DEFENDANT NAME]'}
... Respondent / Defendant

VAKALATNAMA (ADVOCATE AUTHORIZATION DEED)

I/We, ${answers.petitioner || answers.name || '[CLIENT NAME]'}, residing at ${answers.clientAddress || answers.address || '[CLIENT ADDRESS]'}, do hereby appoint and retain:

${answers.advocateName || '[ADVOCATE NAME]'}, Advocate
Karnataka State Bar Council Enrollment No: ${answers.enrollmentNumber || '[KAR/XXXX/YEAR]'}
Office Address: ${answers.officeAddress || '[ADVOCATE OFFICE ADDRESS]'}

to act, appear, plead, and conduct the proceedings on my/our behalf in the above-captioned matter before this Hon'ble Court.

AUTHORIZATION CLAUSES:
1. To file petitions, plaints, written statements, affidavits, and interlocutory applications.
2. To produce and receive documents, deposits, and court fees.
3. To accept notice, summons, or process on my/our behalf.
4. To compromise, compound, or withdraw proceedings under instructions.

Executed at ${answers.place || 'Bengaluru'} on this ${answers.issueDate || new Date().toISOString().split('T')[0]}.

________________________
Executant / Client Signature

ACCEPTED & FILED BY:
________________________
Advocate Signature
(${answers.advocateName || '[ADVOCATE NAME]'})`,

  // 5. Affidavit draft / Affidavit
  Affidavit: (answers) => `BEFORE THE OATH COMMISSIONER / NOTARY PUBLIC
AT ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

AFFIDAVIT OF ${answers.name ? answers.name.toUpperCase() : '[DEPONENT NAME]'}

I, ${answers.name || '[DEPONENT NAME]'}, aged about ____ years, S/o / D/o / W/o ________________, residing at ${answers.address || '[FULL ADDRESS]'}, ${answers.district || '[DISTRICT]'}, do hereby solemnly affirm and state on oath as follows:

1. That I am the deponent herein and fully conversant with the facts stated below.

2. SWORN STATEMENTS OF FACTS:
   ${answers.facts || '[State the exact facts, declarations, name corrections, address proofs, or statements affirmed under oath.]'}

3. That I am making this affidavit to submit before ${answers.respondent || '[CONCERNED AUTHORITY / COURT]'} for official verification and record.

4. That no material fact has been concealed or misrepresented in this affidavit.

VERIFICATION:
I, the Deponent above-named, do hereby verify that the contents of paragraphs 1 to 4 above are true and correct to the best of my knowledge and belief.

Solemnly affirmed at ${answers.district || 'Bengaluru'} on ${answers.issueDate || new Date().toISOString().split('T')[0]}.

_______________________
Deponent Signature

Identified by me:
_______________________
Advocate / Notary`,

  // 6. Consumer Complaint
  'Consumer Complaint': (answers) => `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
AT ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

CONSUMER COMPLAINT NO. _______ / 2026

${answers.name || '[CONSUMER NAME]'}
Residing at: ${answers.address || '[CONSUMER ADDRESS]'}
... Complainant / Consumer

VERSUS

${answers.respondent || '[SELLER / BRAND / COMPANY NAME]'}
Address: ${answers.respondentAddress || '[OPPOSITE PARTY ADDRESS]'}
... Opposite Party / Service Provider

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

1. CONSUMER STATUS:
   The Complainant purchased goods / availed services from the Opposite Party for consideration on ${answers.issueDate || '[DATE]'}.

2. DEFECT / DEFICIENCY IN SERVICE:
   Invoice / Receipt No: ${answers.invoiceNo || '[INVOICE NO]'}
   Purchase Amount: ₹ ${answers.purchaseAmount || '[AMOUNT]'}
   ${answers.facts || '[Describe the product defect, service deficiency, non-refund, or unfair trade practice in detail.]'}

3. JURISDICTION:
   The Complainant resides and the transaction took place within the territorial limits of this Commission.

PRAYER / RELIEF SOUGHT:
The Complainant prays this Hon'ble Commission to direct the Opposite Party to:
a) Refund the purchase amount of ₹ ${answers.purchaseAmount || '[AMOUNT]'} along with 12% p.a. interest.
b) Pay compensation of ₹ ${answers.compensation || '25,000'} for mental agony and deficiency in service.
c) ${answers.relief || 'Pay legal costs of ₹5,000 to the Complainant.'}

Place: ${answers.district || 'Bengaluru'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
Complainant Signature`,

  // 7. Police Complaint
  'Police Complaint': (answers) => `TO
THE STATION HOUSE OFFICER (S.H.O.)
POLICE STATION: ${answers.policeStation || '[POLICE STATION NAME]'}
DISTRICT: ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

SUBJECT: WRITTEN COMPLAINT FOR REGISTRATION OF FIR AND IMMEDIATE LEGAL ACTION.

RESPECTED SIR,

I, ${answers.name || '[COMPLAINANT NAME]'}, S/o / D/o / W/o ________________, residing at ${answers.address || '[ADDRESS]'}, Contact: ${answers.phone || '[PHONE]'}, bring to your immediate notice the following criminal incident:

1. ACCUSED DETAILS:
   Name / Description of Accused: ${answers.respondent || '[NAME OR DESCRIPTION OF ACCUSED PERSON(S)]'}

2. INCIDENT DETAILS:
   Date & Time: ${answers.issueDate || '[DATE AND TIME OF INCIDENT]'}
   Place of Occurrence: ${answers.location || '[EXACT LOCATION / ADDRESS OF INCIDENT]'}

3. DESCRIPTION OF THE OFFENSE:
   ${answers.facts || '[Describe the criminal incident, theft, assault, threats, cheating, or harassment in detail with witness names.]'}

PRAYER / ACTION REQUESTED:
I request you to kindly register a formal FIR under the relevant sections of the Bharatiya Nyaya Sanhita (BNS) / IPC, conduct an immediate investigation, and take appropriate action against the culprits.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Complainant Signature`,

  // 8. Cyber Crime Complaint
  'Cyber Crime Complaint': (answers) => `TO
THE INSPECTOR OF POLICE
CYBER CRIME CRIME BRANCH / EFD CELL
DISTRICT: ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

SUBJECT: COMPLAINT REGARDING ONLINE CYBER FRAUD / FINANCIAL SCAM / ONLINE ABUSE.

RESPECTED SIR,

I, ${answers.name || '[COMPLAINANT NAME]'}, residing at ${answers.address || '[ADDRESS]'}, Phone: ${answers.phone || '[MOBILE NUMBER]'}, report a cyber crime offense as follows:

1. SCAMMER / ACCUSED DETAILS:
   UPI ID / Phone No / Bank Account / URL: ${answers.respondent || '[SCAMMER PHONE / UPI ID / WEBSITE URL]'}

2. TRANSACTION & FRAUD DETAILS:
   Date & Time of Cyber Crime: ${answers.issueDate || '[DATE]'}
   Financial Loss Amount: ₹ ${answers.lossAmount || '[LOSS AMOUNT]'}
   Transaction Reference IDs: ${answers.txnId || '[TRANSACTION REF / UTR NOS]'}

3. STATEMENT OF CYBER INCIDENT:
   ${answers.facts || '[Describe how the online phishing, UPI scam, OTP theft, hacking, or social media harassment occurred.]'}

REQUEST:
Kindly block the scammer's bank account / UPI handle, register a Cyber Crime Complaint, and initiate legal recovery of defrauded funds.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Complainant Signature`,

  // 9. Legal Notice
  'Legal Notice': (answers) => `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE (RPAD)

LEGAL NOTICE

DATE: ${answers.issueDate || new Date().toISOString().split('T')[0]}

TO,
${answers.respondent || '[RECIPIENT FULL NAME]'}
Residing / Located at: ${answers.respondentAddress || '[RECIPIENT FULL ADDRESS]'}

UNDER INSTRUCTIONS FROM MY CLIENT:
${answers.name || '[SENDER / CLIENT NAME]'}, residing at ${answers.address || '[SENDER ADDRESS]'}, ${answers.district || '[DISTRICT]'}, I hereby serve you with this Legal Notice:

1. That my client is ${answers.clientDescription || 'a respectable citizen residing in Karnataka'}.

2. STATEMENT OF BREACH & FACTS:
   a) Date of Transaction / Agreement: ${answers.issueDate || '[DATE]'}
   b) ${answers.facts || '[Describe breach of contract, unpaid monetary dues, illegal encroachment, cheque bounce, or grievance.]'}

3. LEGAL DEMAND & 15-DAY NOTICE:
   You are hereby called upon to comply with the following demands within FIFTEEN (15) DAYS from the receipt of this notice:
   a) ${answers.relief || 'Pay the outstanding amount of ₹_______ along with interest.'}
   b) Refrain from continuing any further illegal acts against my client.

TAKE NOTICE that if you fail to comply with these demands within 15 days, my client will initiate civil and criminal legal proceedings against you in the competent court at your sole risk, cost, and consequence.

_______________________
Advocate / Sender Signature
(${answers.name || '[SENDER NAME]'})`,

  // 10. Reply Notice
  'Reply Notice': (answers) => `BY REGISTERED POST WITH ACKNOWLEDGEMENT DUE

REPLY TO LEGAL NOTICE

DATE: ${answers.issueDate || new Date().toISOString().split('T')[0]}

TO,
${answers.respondent || '[ADVOCATE / SENDER OF NOTICE]'}
Address: ${answers.respondentAddress || '[NOTICE SENDER ADDRESS]'}

RE: REPLY ON BEHALF OF MY CLIENT ${answers.name ? answers.name.toUpperCase() : '[MY CLIENT NAME]'} TO YOUR LEGAL NOTICE DATED ${answers.noticeDate || '[NOTICE DATE]'}.

SIR / MADAM,

Under instructions from my client, ${answers.name || '[MY CLIENT NAME]'}, residing at ${answers.address || '[ADDRESS]'}, I reply to your legal notice as follows:

1. ALL ALLEGATIONS DENIED:
   Every allegation, claim, and demand contained in your legal notice dated ${answers.noticeDate || '[NOTICE DATE]'} is false, frivolous, and categorically denied.

2. CORRECT STATEMENT OF FACTS:
   ${answers.facts || '[State the true facts, payments made, compliance done, or defense refuting the notice claims.]'}

3. CALL UPON SENDER:
   Your client is called upon to unconditionally withdraw the legal notice dated ${answers.noticeDate || '[NOTICE DATE]'} within 7 days. If your client files any vexatious litigation, my client will contest it at your client's risk as to costs.

_______________________
Advocate Signature
For Client: ${answers.name || '[CLIENT NAME]'}`,

  // 11. RTI Application
  'RTI Application': (answers) => `FORM 'A' — APPLICATION FOR OBTAINING INFORMATION
(Under Section 6(1) of the Right to Information Act, 2005)

TO
THE PUBLIC INFORMATION OFFICER (P.I.O.)
DEPARTMENT / OFFICE: ${answers.respondent || '[DEPARTMENT / PUBLIC AUTHORITY NAME]'}
ADDRESS: ${answers.respondentAddress || '[PUBLIC AUTHORITY ADDRESS]'}, ${answers.district || '[DISTRICT]'}, KARNATAKA

1. Full Name of Applicant: ${answers.name || '[APPLICANT NAME]'}
2. Postal Address: ${answers.address || '[APPLICANT ADDRESS]'}, ${answers.district || '[DISTRICT]'}
3. Contact Phone: ${answers.phone || '[PHONE]'}

4. SPECIFIC INFORMATION SOUGHT:
   Please provide certified copies / status of the following information:
   ${answers.facts || 'Point 1: Certified copy of sanction order / file status.\nPoint 2: Certified inspection details of public expenditure.'}

5. PERIOD FOR WHICH INFORMATION IS SOUGHT:
   From ${answers.startDate || '[START DATE]'} To ${answers.issueDate || new Date().toISOString().split('T')[0]}

6. RTI FEE PAYMENT:
   RTI Fee of ₹10/- is paid by Indian Postal Order / Demand Draft No: ${answers.ipoNo || '[IPO NUMBER]'}

7. I state that I am a citizen of India and the information sought does not fall under exemptions of Section 8 of the RTI Act.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Applicant Signature`,

  // 12. Rental Agreement
  'Rental Agreement': (answers) => `RENTAL AGREEMENT (11 MONTHS LEASE)

This Rental Agreement is executed at ${answers.district || 'Bengaluru'} on this ${answers.issueDate || new Date().toISOString().split('T')[0]} by and between:

LESSOR / LANDLORD:
${answers.name || '[LANDLORD NAME]'}, residing at ${answers.address || '[LANDLORD ADDRESS]'} (Hereinafter called the "LESSOR")

AND

LESSEE / TENANT:
${answers.respondent || '[TENANT NAME]'}, residing at ${answers.tenantAddress || '[TENANT PERMANENT ADDRESS]'} (Hereinafter called the "LESSEE")

WHEREAS the Lessor is the absolute owner of the premises situated at:
${answers.propertyAddress || answers.facts || '[COMPLETE RENTAL PROPERTY ADDRESS]'}

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. TENANCY TERM: 11 Months commencing from ${answers.issueDate || new Date().toISOString().split('T')[0]}.
2. MONTHLY RENT: ₹ ${answers.rentAmount || '[RENT AMOUNT]'} per month payable on or before 5th of each month.
3. SECURITY DEPOSIT: ₹ ${answers.depositAmount || '[DEPOSIT AMOUNT]'} paid by Lessee to Lessor by bank transfer.
4. MAINTENANCE & UTILITIES: Electricity & water charges shall be paid directly by the Lessee.
5. TERMINATION: Either party may terminate this agreement by giving ONE (1) month prior written notice.

IN WITNESS WHEREOF the parties have signed this Agreement on the day, month, and year first above written.

_______________________              _______________________
LESSOR (Landlord)                    LESSEE (Tenant)

WITNESSES:
1. ___________________
2. ___________________`,

  // 13. Power of Attorney
  'Power of Attorney': (answers) => `GENERAL POWER OF ATTORNEY (GPA)

KNOW ALL MEN BY THESE PRESENTS that I, ${answers.name || '[PRINCIPAL NAME]'}, residing at ${answers.address || '[PRINCIPAL ADDRESS]'}, ${answers.district || '[DISTRICT]'} (hereinafter called the "PRINCIPAL"), do hereby nominate, appoint, and constitute:

${answers.respondent || '[ATTORNEY / AGENT NAME]'}, residing at ${answers.agentAddress || '[AGENT ADDRESS]'} (hereinafter called the "ATTORNEY"), as my true and lawful Attorney in my name and on my behalf.

TO DO THE FOLLOWING ACTS, DEEDS, AND THINGS:
1. To manage, control, and look after my property / legal affairs situated at ${answers.facts || '[PROPERTY / JURISDICTION DETAILS]'}.
2. To sign applications, affidavits, representation letters, and appear before government & municipal offices.
3. To represent me in legal proceedings, retain advocates, and sign plaints/petitions.
4. To collect rents, issue receipts, and deposit funds in my bank account.

I hereby ratify and confirm all acts done by my Attorney pursuant to these presents.

IN WITNESS WHEREOF I have executed this Power of Attorney on ${answers.issueDate || new Date().toISOString().split('T')[0]} at ${answers.district || 'Bengaluru'}.

_______________________
PRINCIPAL (Grantor Signature)

ACCEPTED BY:
_______________________
ATTORNEY (Agent Signature)`,

  // Default fallback for any remaining custom types
  default: (docType, answers) => `${docType.toUpperCase()} DRAFT\n
Applicant / Party 1: ${answers.name || '[Name]'}
District: ${answers.district || 'Bengaluru'}
Opposite Party / Authority: ${answers.respondent || '[Opposite Party]'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

Statement of Facts & Background:
${answers.facts || '[Details of facts, agreements, dates, and grievances.]'}

Relief / Prayer:
${answers.relief || 'I request the authority / court to grant appropriate relief as per law.'}

Verification:
Verified that the statements above are true to the best of my knowledge.`
};

export function getFormattedDraft(docType, answers) {
  const formatter = DOCUMENT_DRAFT_TEMPLATES[docType] || DOCUMENT_DRAFT_TEMPLATES.default;
  if (typeof formatter === 'function') {
    return formatter === DOCUMENT_DRAFT_TEMPLATES.default ? formatter(docType, answers) : formatter(answers);
  }
  return DOCUMENT_DRAFT_TEMPLATES.default(docType, answers);
}
