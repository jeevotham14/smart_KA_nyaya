/**
 * Smart Karnataka Nyaya — Distinct Legal Document Draft Generators
 * Specialized templates for all 24 supported legal document types in both English and Kannada (Meaningful Translation).
 */

export const DOCUMENT_DRAFT_TEMPLATES = {
  // 1. Complaint
  Complaint: (answers, lang) => {
    if (lang === 'kn') {
      return `ಮಾನ್ಯ ಪ್ರಧಾನ ಸಿವಿಲ್ ನ್ಯಾಯಾಧೀಶರ ನ್ಯಾಯಾಲಯದಲ್ಲಿ
ಸ್ಥಳ: ${answers.district ? answers.district : 'ಬೆಂಗಳೂರು'}, ಕರ್ನಾಟಕ

ಸಿವಿಲ್ ದೂರು ಸಂಖ್ಯೆ: _______ / ೨೦೨೬

${answers.name || '[ದೂರುದಾರರ ಹೆಸರು]'}
ವಾಸಿ: ${answers.address || '[ವಿಳಾಸ]'}, ${answers.district || '[ಜಿಲ್ಲೆ]'}
... ದೂರುದಾರರು / ಫಿರ್ಯಾದಿ

ವಿರುದ್ಧ

${answers.respondent || '[ಎದುರು ಪಕ್ಷ / ಪ್ರತಿವಾದಿಯ ಹೆಸರು]'}
ವಾಸಿ: ${answers.respondentAddress || '[ಎದುರು ಪಕ್ಷದ ವಿಳಾಸ]'}
... ಎದುರು ಪಕ್ಷ / ಪ್ರತಿವಾದಿ

ಕರ್ನಾಟಕ ಸಿವಿಲ್ ನಡಾವಳಿ ನಿಯಮಾವಳಿಗಳ ಅಡಿಯಲ್ಲಿ ಸಿವಿಲ್ ದೂರು ಅರ್ಜಿ

ದೂರುದಾರರು ಮಾನ್ಯ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಗೌರವಪೂರ್ವಕವಾಗಿ ಸಲ್ಲಿಸುವ ಮನವಿ:

೧. ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿ:
   ದೂರುದಾರರು ${answers.district || '[ಜಿಲ್ಲೆ]'} ಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದು, ಈ ಮಾನ್ಯ ನ್ಯಾಯಾಲಯದ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಘಟನೆ ಸಂಭವಿಸಿದೆ.

೨. ಪ್ರಕರಣದ ಸತ್ಯಸಂಗತಿಗಳು:
   ಅ) ಘಟನೆಯ ದಿನಾಂಕ: ${answers.issueDate || '[ದಿನಾಂಕ]'}
   ಆ) ${answers.facts || '[ಘಟನೆಗಳ ವಿವರ, ಒಪ್ಪಂದದ ಮಾಹಿತಿ ಮತ್ತು ದೂರಿನ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ.]'}

೩. ದೂರಿಗೆ ಕಾರಣ:
   ದೂರುದಾರರ ಕಾನೂನುಬದ್ಧ ಹಕ್ಕುಗಳನ್ನು ಎದುರು ಪಕ್ಷವು ನಿರಾಕರಿಸಿದ ಕಾರಣ ${answers.issueDate || '[ದಿನಾಂಕ]'} ರಂದು ದೂರಿಗೆ ಕಾರಣ ಉಂಟಾಯಿತು.

ಕೋರಿಕೆ / ಪ್ರಾರ್ಥನೆ:
ಆದ್ದರಿಂದ ದೂರುದಾರರು ಮಾನ್ಯ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಪ್ರಾರ್ಥಿಸುವುದೇನೆಂದರೆ:
ಅ) ${answers.relief || 'ಎದುರು ಪಕ್ಷವು ತಮ್ಮ ಬಾಧ್ಯತೆಯನ್ನು ಪೂರೈಸಲು ಮತ್ತು ದೂರುದಾರರಿಗೆ ಸೂಕ್ತ ಪರಿಹಾರ ನೀಡಲು ನಿರ್ದೇಶಿಸಬೇಕು.'}
ಆ) ಈ ದೂರಿನ ನ್ಯಾಯಾಲಯ ವೆಚ್ಚವನ್ನು ದೂರುದಾರರಿಗೆ ಕೊಡಿಸಬೇಕು.
ಇ) ನ್ಯಾಯದ ಹಿತದೃಷ್ಟಿಯಿಂದ ಮಾನ್ಯ ನ್ಯಾಯಾಲಯವು ಸೂಕ್ತವೆಂದು ಕಾಣುವ ಇತರ ಆದೇಶಗಳನ್ನು ಹೊರಡಿಸಬೇಕು.

ಸ್ಥಳ: ${answers.district || 'ಬೆಂಗಳೂರು'}
ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
ದೂರುದಾರರ ಸಹಿ

ಸತ್ಯಾಪನೆ (Verification)
ನಾನು, ${answers.name || '[ಹೆಸರು]'}, ಮೇಲ್ಕಂಡ ೧ ರಿಂದ ೩ ನೇ ಪ್ಯಾರಾಗಳಲ್ಲಿರುವ ವಿವರಗಳು ನನ್ನ ತಿಳುವಳಿಕೆಗೆ ತಕ್ಕಂತೆ ಸತ್ಯ ಮತ್ತು ಸರಿಯಾಗಿವೆ ಎಂದು ಈ ಮೂಲಕ ಸತ್ಯಾಪಿಸುತ್ತೇನೆ.

_______________________
ಸತ್ಯಾಪಕರು / ದೂರುದಾರರು`;
    }

    return `IN THE COURT OF THE PRINCIPAL CIVIL JUDGE
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
I, ${answers.name || '[NAME]'}, do hereby declare that the contents of paragraphs 1 to 3 above are true and correct to the best of my knowledge, information, and belief.

_______________________
Deponent / Complainant`;
  },

  // 2. Police Complaint
  'Police Complaint': (answers, lang) => {
    if (lang === 'kn') {
      return `ಗೆ:
ಶ್ರೀಯುತ ಪೊಲೀಸ್ ಠಾಣಾಧಿಕಾರಿಯವರಿಗೆ (S.H.O.)
ಪೊಲೀಸ್ ಠಾಣೆ: ${answers.policeStation || '[ಪೊಲೀಸ್ ಠಾಣೆಯ ಹೆಸರು]'}
ಜಿಲ್ಲೆ: ${answers.district ? answers.district : 'ಬೆಂಗಳೂರು'}, ಕರ್ನಾಟಕ

ವಿಷಯ: ಎಫ್‌ಐಆರ್ (FIR) ದಾಖಲಿಸಿ ತಕ್ಷಣದ ಕಾನೂನು ಕ್ರಮ ಕೈಗೊಳ್ಳುವಂತೆ ಲಿಖಿತ ದೂರು.

ಮಾನ್ಯರೇ,

ನಾನು, ${answers.name || '[ದೂರುದಾರರ ಹೆಸರು]'}, ವಾಸಿ: ${answers.address || '[ವಿಳಾಸ]'}, ಫೋನ್: ${answers.phone || '[ಫೋನ್ ಸಂಖ್ಯೆ]'}, ತಮ್ಮ ಗಮನಕ್ಕೆ ತರುವ ಅಪರಾಧ ಘಟನೆಯ ವಿವರಗಳು ಕೆಳಗಿನಂತಿವೆ:

೧. ಆರೋಪಿಗಳ ವಿವರ:
   ಆರೋಪಿ ವ್ಯಕ್ತಿಗಳ ಹೆಸರು / ಗುರುತು: ${answers.respondent || '[ಆರೋಪಿಗಳ ಹೆಸರು ಅಥವಾ ವಿವರಣೆ]'}

೨. ಘಟನೆಯ ವಿವರಗಳು:
   ದಿನಾಂಕ ಮತ್ತು ಸಮಯ: ${answers.issueDate || '[ದಿನಾಂಕ ಮತ್ತು ಸಮಯ]'}
   ಘಟನೆ ನಡೆದ ಸ್ಥಳ: ${answers.location || '[ಅಪರಾಧ ನಡೆದ ಸ್ಥಳದ ವಿಳಾಸ]'}

೩. ಅಪರಾಧ ಕೃತ್ಯದ ಸಾರಾಂಶ:
   ${answers.facts || '[ಹಲ್ಲೆ, ಕಳವು, ಪ್ರಾಣ ಬೆದರಿಕೆ, ವಂಚನೆ ಅಥವಾ ಕಿರುಕುಳದ ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ.]'}

ಕೋರಿಕೆ / ಪ್ರಾರ್ಥನೆ:
ಆದ್ದರಿಂದ ತಾವು ತಕ್ಷಣವೇ ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ (BNS) ಯ ಸಂಬಂಧಿಸಿದ ಸೆಕ್ಷನ್‌ಗಳ ಅಡಿಯಲ್ಲಿ ಎಫ್‌ಐಆರ್ (FIR) ದಾಖಲಿಸಿ, ತನಿಖೆ ನಡೆಸಿ ಆರೋಪಿಗಳ ವಿರುದ್ಧ ಕಾನೂನು ಕ್ರಮ ಜರುಗಿಸಬೇಕಾಗಿ ವಿನಂತಿಸುತ್ತೇನೆ.

ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}
ಸ್ಥಳ: ${answers.district || 'ಬೆಂಗಳೂರು'}

_______________________
ದೂರುದಾರರ ಸಹಿ`;
    }

    return `TO
THE STATION HOUSE OFFICER (S.H.O.)
POLICE STATION: ${answers.policeStation || '[POLICE STATION NAME]'}
DISTRICT: ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

SUBJECT: WRITTEN COMPLAINT FOR REGISTRATION OF FIR AND IMMEDIATE LEGAL ACTION.

RESPECTED SIR,

I, ${answers.name || '[COMPLAINANT NAME]'}, residing at ${answers.address || '[ADDRESS]'}, Contact: ${answers.phone || '[PHONE]'}, bring to your immediate notice the following criminal incident:

1. ACCUSED DETAILS:
   Name / Description of Accused: ${answers.respondent || '[NAME OR DESCRIPTION OF ACCUSED PERSON(S)]'}

2. INCIDENT DETAILS:
   Date & Time: ${answers.issueDate || '[DATE AND TIME OF INCIDENT]'}
   Place of Occurrence: ${answers.location || '[EXACT LOCATION / ADDRESS OF INCIDENT]'}

3. DESCRIPTION OF THE OFFENSE:
   ${answers.facts || '[Describe the criminal incident, theft, assault, threats, cheating, or harassment in detail with witness names.]'}

PRAYER / ACTION REQUESTED:
I request you to kindly register a formal FIR under the relevant sections of the Bharatiya Nyaya Sanhita (BNS), conduct an immediate investigation, and take appropriate action against the culprits.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Complainant Signature`;
  },

  // 3. Cyber Crime Complaint
  'Cyber Crime Complaint': (answers, lang) => {
    if (lang === 'kn') {
      return `ಗೆ:
ಪೊಲೀಸ್ ಇನ್ಸ್‌ಪೆಕ್ಟರ್ ರವರಿಗೆ
ಸೈಬರ್ ಅಪರಾಧ ಪೊಲೀಸ್ ಠಾಣೆ (Cyber Crime Cell)
ಜಿಲ್ಲೆ: ${answers.district ? answers.district : 'ಬೆಂಗಳೂರು'}, ಕರ್ನಾಟಕ

ವಿಷಯ: ಆನ್‌ಲೈನ್ ಸೈಬರ್ ವಂಚನೆ / ಯುಪಿಐ ಹಣಕಾಸು ಮೋಸದ ಕುರಿತು ದೂರು.

ಮಾನ್ಯರೇ,

ನಾನು, ${answers.name || '[ದೂರುದಾರರ ಹೆಸರು]'}, ವಾಸಿ: ${answers.address || '[ವಿಳಾಸ]'}, ಮೊಬೈಲ್: ${answers.phone || '[ಮೊಬೈಲ್ ಸಂಖ್ಯೆ]'}, ನಮಗೆ ನಡೆದ ಸೈಬರ್ ಅಪರಾಧದ ಬಗ್ಗೆ ದೂರು ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ:

೧. ವಂಚಕನ ವಿವರಗಳು:
   ಯುಪಿಐ ID / ಫೋನ್ ನಂ / ಬ್ಯಾಂಕ್ ಖಾತೆ / ವೆಬ್‌ಸೈಟ್: ${answers.respondent || '[ವಂಚಕನ ಯುಪಿಐ ID / ಫೋನ್ ನಂ / ಲಿಂಕ್]'}

೨. ವಹಿವಾಟು ಮತ್ತು ನಷ್ಟದ ವಿವರ:
   ವಂಚನೆ ನಡೆದ ದಿನಾಂಕ: ${answers.issueDate || '[ದಿನಾಂಕ]'}
   ಕಳೆದುಕೊಂಡ ಹಣದ ಮೊತ್ತ: ₹ ${answers.lossAmount || '[ಮೊತ್ತ]'}
   ವಹಿವಾಟು ಉಲ್ಲೇಖ (Ref/UTR) ಸಂಖ್ಯೆ: ${answers.txnId || '[UTR ಸಂಖ್ಯೆ]'}

೩. ಘಟನೆಯ ವಿವರಣೆ:
   ${answers.facts || '[ಆನ್‌ಲೈನ್ ಒಟಿಪಿ ವಂಚನೆ, ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮೋಸ, ಅಥವಾ ಸೈಬರ್ ಕಿರುಕುಳ ಹೇಗೆ ನಡೆಯಿತು ಎಂಬುದನ್ನು ವಿವರಿಸಿ.]'}

ಕೋರಿಕೆ:
ವಂಚಕನ ಬ್ಯಾಂಕ್ ಖಾತೆ ಬ್ಲಾಕ್ ಮಾಡಲು ಮತ್ತು ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣ ದಾಖಲಿಸಿ ಹಣ ಹಿಂಪಡೆಯಲು ಸಹಾಯ ಮಾಡಬೇಕಾಗಿ ಕೋರುತ್ತೇನೆ.

ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}
ಸ್ಥಳ: ${answers.district || 'ಬೆಂಗಳೂರು'}

_______________________
ದೂರುದಾರರ ಸಹಿ`;
    }

    return `TO
THE INSPECTOR OF POLICE
CYBER CRIME BRANCH / EFD CELL
DISTRICT: ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

SUBJECT: COMPLAINT REGARDING ONLINE CYBER FRAUD / FINANCIAL SCAM.

RESPECTED SIR,

I, ${answers.name || '[COMPLAINANT NAME]'}, residing at ${answers.address || '[ADDRESS]'}, Phone: ${answers.phone || '[MOBILE NUMBER]'}, report a cyber crime offense as follows:

1. SCAMMER / ACCUSED DETAILS:
   UPI ID / Phone No / Bank Account / URL: ${answers.respondent || '[SCAMMER PHONE / UPI ID / WEBSITE URL]'}

2. TRANSACTION & FRAUD DETAILS:
   Date & Time: ${answers.issueDate || '[DATE]'}
   Financial Loss Amount: ₹ ${answers.lossAmount || '[LOSS AMOUNT]'}
   Transaction Reference IDs: ${answers.txnId || '[TRANSACTION REF / UTR NOS]'}

3. STATEMENT OF CYBER INCIDENT:
   ${answers.facts || '[Describe how the online phishing, UPI scam, OTP theft, or hacking occurred.]'}

REQUEST:
Kindly block the scammer's account, register a Cyber Crime Complaint, and initiate legal recovery of defrauded funds.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Complainant Signature`;
  },

  // 4. Consumer Complaint
  'Consumer Complaint': (answers, lang) => {
    if (lang === 'kn') {
      return `ಮಾನ್ಯ ಜಿಲ್ಲಾ ಗ್ರಾಹಕರ ವಿವಾದ ಪರಿಹಾರ ಆಯೋಗದಲ್ಲಿ
ಸ್ಥಳ: ${answers.district ? answers.district : 'ಬೆಂಗಳೂರು'}, ಕರ್ನಾಟಕ

ಗ್ರಾಹಕ ದೂರು ಸಂಖ್ಯೆ: _______ / ೨೦೨೬

${answers.name || '[ಗ್ರಾಹಕರ ಹೆಸರು]'}
ವಾಸಿ: ${answers.address || '[ವಿಳಾಸ]'}
... ದೂರುದಾರರು / ಗ್ರಾಹಕರು

ವಿರುದ್ಧ

${answers.respondent || '[ಮಾರಾಟಗಾರ / ಕಂಪನಿಯ ಹೆಸರು]'}
ವಿಳಾಸ: ${answers.respondentAddress || '[ಎದುರು ಪಕ್ಷದ ವಿಳಾಸ]'}
... ಎದುರು ಪಕ್ಷ / ಸೇವಾ ಪೂರೈಕೆದಾರರು

ಗ್ರಾಹಕ ರಕ್ಷಣೆ ಕಾಯ್ದೆ ೨೦೧೯ ರ ಸೆಕ್ಷನ್ ೩೫ ರ ಅಡಿಯಲ್ಲಿ ದೂರು ಅರ್ಜಿ

೧. ಗ್ರಾಹಕರ ಅರ್ಹತೆ:
   ದೂರುದಾರರು ಎದುರು ಪಕ್ಷದಿಂದ ದಿನಾಂಕ ${answers.issueDate || '[ದಿನಾಂಕ]'} ರಂದು ಹಣ ನೀಡಿ ವಸ್ತು/ಸೇವೆ ಖರೀದಿಸಿದ್ದಾರೆ.

೨. ವಸ್ತುವಿನ ದೋಷ / ಸೇವೆಯಲ್ಲಿ ಕಳಪೆತನ:
   ಖರೀದಿ ರಸೀದಿ ಸಂಖ್ಯೆ: ${answers.invoiceNo || '[ರಸೀದಿ ನಂ]'}
   ಖರೀದಿಸಿದ ಮೊತ್ತ: ₹ ${answers.purchaseAmount || '[ಮೊತ್ತ]'}
   ${answers.facts || '[ವಸ್ತುವಿನ ದೋಷ, ಸೇವೆಯ ಕೊರತೆ ಅಥವಾ ಮರುಪಾವತಿ ನಿರಾಕರಣೆಯ ವಿವರಗಳನ್ನು ವಿವರಿಸಿ.]'}

ಕೋರಿಕೆ / ಪ್ರಾರ್ಥನೆ:
ಆದ್ದರಿಂದ ಮಾನ್ಯ ಆಯೋಗವು ಎದುರು ಪಕ್ಷಕ್ಕೆ ಕೆಳಗಿನಂತೆ ನಿರ್ದೇಶಿಸಬೇಕಾಗಿ ಪ್ರಾರ್ಥನೆ:
ಅ) ಖರೀದಿಸಿದ ಮೊತ್ತ ರೂ. ${answers.purchaseAmount || '[ಮೊತ್ತ]'} ಅನ್ನು ಶೇಕಡಾ ೧೨ ಬಡ್ಡಿಯೊಂದಿಗೆ ಮರುಪಾವತಿಸಲು.
ಆ) ಮಾನಸಿಕ ಕಿರುಕುಳಕ್ಕೆ ಪರಿಹಾರವಾಗಿ ರೂ. ${answers.compensation || '೨೫,೦೦೦'} ಪಾವತಿಸಲು.
ಇ) ದೂರಿನ ವೆಚ್ಚವಾಗಿ ರೂ. ೫,೦೦೦ ಕೊಡಿಸಲು.

ಸ್ಥಳ: ${answers.district || 'ಬೆಂಗಳೂರು'}
ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
ದೂರುದಾರರ ಸಹಿ`;
    }

    return `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
AT ${answers.district ? answers.district.toUpperCase() : 'BENGALURU'}, KARNATAKA

CONSUMER COMPLAINT NO. _______ / 2026

${answers.name || '[CONSUMER NAME]'}
... Complainant
VERSUS
${answers.respondent || '[SELLER / BRAND NAME]'}
... Opposite Party

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

1. Defect / Deficiency in Service: ${answers.facts || '[Describe defects, deficiency, and non-refund.]'}
2. Relief: Refund of ₹${answers.purchaseAmount || '[AMOUNT]'} plus compensation of ₹${answers.compensation || '25,000'}.

Place: ${answers.district || 'Bengaluru'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

_______________________
Complainant Signature`;
  },

  // 5. RTI Application
  'RTI Application': (answers, lang) => {
    if (lang === 'kn') {
      return `ನಮೂನೆ 'ಎ' — ಮಾಹಿತಿ ಪಡೆಯಲು ಅರ್ಜಿ
(ಮಾಹಿತಿ ಹಕ್ಕು ಕಾಯ್ದೆ ೨೦೦೫ ರ ಸೆಕ್ಷನ್ ೬(೧) ರ ಅಡಿಯಲ್ಲಿ)

ಗೆ:
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (P.I.O.)
ಇಲಾಖೆ / ಕಚೇರಿ: ${answers.respondent || '[ಇಲಾಖೆಯ ಹೆಸರು]'}
ವಿಳಾಸ: ${answers.respondentAddress || '[ಕಚೇರಿ ವಿಳಾಸ]'}, ${answers.district || '[ಜಿಲ್ಲೆ]'}, ಕರ್ನಾಟಕ

೧. ಅರ್ಜಿದಾರರ ಪೂರ್ಣ ಹೆಸರು: ${answers.name || '[ಅರ್ಜಿದಾರರ ಹೆಸರು]'}
೨. ಅಂಚೆ ವಿಳಾಸ: ${answers.address || '[ವಿಳಾಸ]'}, ${answers.district || '[ಜಿಲ್ಲೆ]'}
೩. ಸಂಪರ್ಕ ದೂರವಾಣಿ: ${answers.phone || '[ಫೋನ್]'}

೪. ಕೋರುತ್ತಿರುವ ನಿರ್ದಿಷ್ಟ ಮಾಹಿತಿ:
   ಕೆಳಗಿನ ವಿಷಯಗಳ ಬಗ್ಗೆ ದೃಢೀಕೃತ ಪ್ರತಿ / ಮಾಹಿತಿಯನ್ನು ನೀಡಬೇಕಾಗಿ ವಿನಂತಿ:
   ${answers.facts || 'ಅಂಶ ೧: ಮಂಜೂರಾತಿ ಆದೇಶದ ದೃಢೀಕೃತ ಪ್ರತಿ ನೀಡಲು...\nಅಂಶ ೨: ಕಾಮಗಾರಿ ವೆಚ್ಚದ ವಿವರ ನೀಡಲು...'}

೫. ಮಾಹಿತಿ ಕೋರುತ್ತಿರುವ ಅವಧಿ: ${answers.startDate || '[ಆರಂಭ ದಿನಾಂಕ]'} ರಿಂದ ${answers.issueDate || new Date().toISOString().split('T')[0]} ರವರೆಗೆ.

೬. ಅರ್ಜಿ ಶುಲ್ಕ: ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ಶುಲ್ಕ ರೂ. ೧೦/- ಅನ್ನು ಪೋಸ್ಟಲ್ ಆರ್ಡರ್ ಮೂಲಕ ಪಾವತಿಸಲಾಗಿದೆ (IPO ನಂ: ${answers.ipoNo || '[IPO ಸಂಖ್ಯೆ]'}).

ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}
ಸ್ಥಳ: ${answers.district || 'ಬೆಂಗಳೂರು'}

_______________________
ಅರ್ಜಿದಾರರ ಸಹಿ`;
    }

    return `FORM 'A' — APPLICATION FOR OBTAINING INFORMATION
(Under Section 6(1) of the Right to Information Act, 2005)

TO
THE PUBLIC INFORMATION OFFICER (P.I.O.)
DEPARTMENT: ${answers.respondent || '[DEPARTMENT NAME]'}
ADDRESS: ${answers.respondentAddress || '[ADDRESS]'}, ${answers.district || '[DISTRICT]'}, KARNATAKA

1. Full Name of Applicant: ${answers.name || '[APPLICANT NAME]'}
2. Address: ${answers.address || '[ADDRESS]'}
3. Information Sought:
   ${answers.facts || 'Point 1: Provide certified copy of file status.\nPoint 2: Provide details of expenditure.'}

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.district || 'Bengaluru'}

_______________________
Applicant Signature`;
  },

  // 6. Rental Agreement
  'Rental Agreement': (answers, lang) => {
    if (lang === 'kn') {
      return `ಮನೆ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಪತ್ರ (೧೧ ತಿಂಗಳ ಅವಧಿ)

ಈ ಮನೆ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ಪತ್ರವನ್ನು ದಿನಾಂಕ ${answers.issueDate || new Date().toISOString().split('T')[0]} ರಂದು ${answers.district || 'ಬೆಂಗಳೂರು'} ನಲ್ಲಿ ಬರೆದುಕೊಳ್ಳಲಾಗಿದೆ:

ಮನೆ ಮಾಲೀಕರು (LESSOR):
${answers.name || '[ಮಾಲೀಕರ ಹೆಸರು]'}, ವಾಸಿ: ${answers.address || '[ಮಾಲೀಕರ ವಿಳಾಸ]'}

ಮತ್ತು

ಬಾಡಿಗೆದಾರರು (LESSEE):
${answers.respondent || '[ಬಾಡಿಗೆದಾರರ ಹೆಸರು]'}, ವಾಸಿ: ${answers.tenantAddress || '[ಬಾಡಿಗೆದಾರರ ವಿಳಾಸ]'}

ಬಾಡಿಗೆ ಮನೆಯ ವಿಳಾಸ:
${answers.propertyAddress || answers.facts || '[ಮನೆಯ ಸಂಪೂರ್ಣ ವಿಳಾಸ]'}

ಒಪ್ಪಂದದ ಶರತ್ತುಗಳು:
೧. ಒಪ್ಪಂದದ ಅವಧಿ: ೧೧ ತಿಂಗಳು (ಪ್ರಾರಂಭದ ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}).
೨. ಮಾಸಿಕ ಬಾಡಿಗೆ: ರೂ. ${answers.rentAmount || '[ಬಾಡಿಗೆ ಮೊತ್ತ]'} ಪ್ರತಿ ತಿಂಗಳು ೫ ನೇ ತಾರೀಖಿನ ಒಳಗಾಗಿ ಪಾವತಿಸಬೇಕು.
೩. ಅಡ್ವಾನ್ಸ್ ಮುಂಗಡ ಹಣ: ರೂ. ${answers.depositAmount || '[ಅಡ್ವಾನ್ಸ್ ಮೊತ್ತ]'} ಮಾಲೀಕರಿಗೆ ನೀಡಲಾಗಿದೆ.
೪. ವಿದ್ಯುತ್ ಮತ್ತು ನೀರು ದರ: ಬಾಡಿಗೆದಾರರೇ ಪ್ರತ್ಯೇಕವಾಗಿ ಪಾವತಿಸತಕ್ಕದ್ದು.
೫. ಖಾಲಿ ಮಾಡುವಿಕೆ: ಯಾವುದೇ ಒಂದು ಪಕ್ಷವು ೧ ತಿಂಗಳ ಮುಂಚಿತ ನೋಟೀಸ್ ನೀಡಬೇಕು.

ಇದಕ್ಕೆ ಸಾಕ್ಷಿಯಾಗಿ ಇಬ್ಬರೂ ಸಹಿ ಮಾಡಿದ್ದೇವೆ.

_______________________              _______________________
ಮನೆ ಮಾಲೀಕರ ಸಹಿ                       ಬಾಡಿಗೆದಾರರ ಸಹಿ

ಸಾಕ್ಷಿಗಳು:
೧. ___________________
೨. ___________________`;
    }

    return `RENTAL AGREEMENT (11 MONTHS LEASE)

Executed at ${answers.district || 'Bengaluru'} on ${answers.issueDate || new Date().toISOString().split('T')[0]} between:

LESSOR / LANDLORD: ${answers.name || '[LANDLORD NAME]'}
LESSEE / TENANT: ${answers.respondent || '[TENANT NAME]'}

PROPERTY ADDRESS: ${answers.propertyAddress || answers.facts || '[PROPERTY ADDRESS]'}

TERMS:
1. Rent: ₹${answers.rentAmount || '[RENT]'} / month.
2. Security Deposit: ₹${answers.depositAmount || '[DEPOSIT]'}.
3. Notice Period: 1 Month.

_______________________              _______________________
LESSOR (Landlord)                    LESSEE (Tenant)`;
  },

  // 7. Vakalatnama placeholder
  'Vakalatnama placeholder': (answers, lang) => {
    if (lang === 'kn') {
      return `ಮಾನ್ಯ ಹೈಕೋರ್ಟ್ / ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯದಲ್ಲಿ
ಸ್ಥಳ: ${answers.place || 'ಬೆಂಗಳೂರು'}

ಪ್ರಕರಣ ಸಂಖ್ಯೆ: ${answers.caseNumber || '_______ / ೨೦೨೬'}

${answers.petitioner || answers.name || '[ಕಕ್ಷಿಗಾರರ ಹೆಸರು]'} ... ಅರ್ಜಿದಾರರು / ಫಿರ್ಯಾದಿ
ವಿರುದ್ಧ
${answers.respondent || '[ಎದುರು ಪಕ್ಷದ ಹೆಸರು]'} ... ಪ್ರತಿವಾದಿ

ವಕಾಲತ್ನಾಮಾ (ವಕೀಲರ ಅಧಿಕಾರ ಪತ್ರ)

ನಾನು/ನಾವು, ${answers.petitioner || answers.name || '[ಕಕ್ಷಿಗಾರರ ಹೆಸರು]'}, ವಾಸಿ: ${answers.clientAddress || answers.address || '[ವಿಳಾಸ]'}, ನನ್ನ/ನಮ್ಮ ಪರವಾಗಿ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ವಾದಿಸಲು ಕೆಳಗಿನ ವಕೀಲರನ್ನು ನಿಯೋಜಿಸಿದ್ದೇನೆ:

ವಕೀಲರ ಹೆಸರು: ${answers.advocateName || '[ವಕೀಲರ ಹೆಸರು]'}, ವಕೀಲರು
ನೋಂದಣಿ ಸಂಖ್ಯೆ (Enrollment): ${answers.enrollmentNumber || '[KAR/XXXX/YEAR]'}
ಕಚೇರಿ ವಿಳಾಸ: ${answers.officeAddress || '[ವಕೀಲರ ಕಚೇರಿ ವಿಳಾಸ]'}

ಅಧಿಕಾರಗಳು:
೧. ದಾವೆ, ಅರ್ಜಿ, ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಪ್ರತ್ಯುತ್ತರಗಳನ್ನು ಸಲ್ಲಿಸಲು.
೨. ದಾಖಲೆಗಳನ್ನು ಹಾಜರುಪಡಿಸಲು ಮತ್ತು ಸ್ವೀಕರಿಸಲು.
೩. ನನ್ನ/ನಮ್ಮ ಪರವಾಗಿ ಸಮನ್ಸ್ ಮತ್ತು ನೋಟೀಸ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲು.

ಸ್ಥಳ: ${answers.place || 'ಬೆಂಗಳೂರು'}
ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}

________________________
ಕಕ್ಷಿಗಾರರ ಸಹಿ

ಅಂಗೀಕರಿಸಲಾಗಿದೆ:
________________________
ವಕೀಲರ ಸಹಿ (${answers.advocateName || '[ವಕೀಲರ ಹೆಸರು]'})`;
    }

    return `IN THE COURT OF ${answers.courtName || 'THE HIGH COURT OF KARNATAKA'}
AT ${answers.place || 'BENGALURU'}

CASE NO. ${answers.caseNumber || '_______ / 2026'}

${answers.petitioner || answers.name || '[CLIENT NAME]'} ... Petitioner / Plaintiff
VERSUS
${answers.respondent || '[RESPONDENT NAME]'} ... Respondent / Defendant

VAKALATNAMA (ADVOCATE AUTHORIZATION DEED)

I/We appoint ${answers.advocateName || '[ADVOCATE NAME]'}, Advocate (Enrollment No: ${answers.enrollmentNumber || '[KAR/XXXX/YEAR]'}), to act, appear, and plead for me/us before this Hon'ble Court.

Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}
Place: ${answers.place || 'Bengaluru'}

________________________
Executant / Client Signature

ACCEPTED BY:
________________________
Advocate Signature`;
  },

  // Default fallback for remaining types
  default: (docType, answers, lang) => {
    if (lang === 'kn') {
      return `${docType.toUpperCase()} ಕರಡು (ಕನ್ನಡ)\n
ಅರ್ಜಿದಾರರು / ಪಕ್ಷ ೧: ${answers.name || '[ಹೆಸರು]'}
ಜಿಲ್ಲೆ: ${answers.district || 'ಬೆಂಗಳೂರು'}
ಎದುರು ಪಕ್ಷ / ಪ್ರಾಧಿಕಾರ: ${answers.respondent || '[ಎದುರು ಪಕ್ಷ]'}
ದಿನಾಂಕ: ${answers.issueDate || new Date().toISOString().split('T')[0]}

ಪ್ರಕರಣದ ಸತ್ಯಸಂಗತಿಗಳು & ವಿವರಗಳು:
${answers.facts || '[ಘಟನೆಗಳ ವಿವರ, ಒಪ್ಪಂದಗಳು, ಮತ್ತು ದೂರಿನ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ.]'}

ಕೋರಿಕೆ / ಪ್ರಾರ್ಥನೆ:
${answers.relief || 'ಮಾನ್ಯ ಪ್ರಾಧಿಕಾರವು ಕಾನೂನಿನಂತೆ ಸೂಕ್ತ ಪರಿಹಾರವನ್ನು ನೀಡಬೇಕಾಗಿ ವಿನಂತಿಸುತ್ತೇನೆ.'}

ಸತ್ಯಾಪನೆ:
ಮೇಲ್ಕಂಡ ವಿವರಗಳು ನನ್ನ ತಿಳುವಳಿಕೆಗೆ ಸತ್ಯವಾಗಿವೆ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ.`;
    }

    return `${docType.toUpperCase()} DRAFT\n
Applicant / Party 1: ${answers.name || '[Name]'}
District: ${answers.district || 'Bengaluru'}
Opposite Party / Authority: ${answers.respondent || '[Opposite Party]'}
Date: ${answers.issueDate || new Date().toISOString().split('T')[0]}

Statement of Facts & Background:
${answers.facts || '[Details of facts, agreements, dates, and grievances.]'}

Relief / Prayer:
${answers.relief || 'I request the authority / court to grant appropriate relief as per law.'}

Verification:
Verified that the statements above are true to the best of my knowledge.`;
  }
};

export function getFormattedDraft(docType, answers, lang = 'en') {
  const formatter = DOCUMENT_DRAFT_TEMPLATES[docType] || DOCUMENT_DRAFT_TEMPLATES.default;
  if (typeof formatter === 'function') {
    return formatter === DOCUMENT_DRAFT_TEMPLATES.default ? formatter(docType, answers, lang) : formatter(answers, lang);
  }
  return DOCUMENT_DRAFT_TEMPLATES.default(docType, answers, lang);
}
