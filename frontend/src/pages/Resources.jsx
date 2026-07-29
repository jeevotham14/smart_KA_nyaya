import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink,
  Loader2, RefreshCw, Scale, Shield, ShoppingCart, Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { legalApi } from '../services/api.js';

export const RESOURCE_CONTENT = {
  dlsa: {
    icon: Scale,
    color: 'text-legalGold',
    title: 'How to Approach DLSA',
    titleKn: 'ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವನ್ನು (DLSA) ಸಂಪರ್ಕಿಸುವ ವಿಧಾನ',
    desc: 'A plain-language guide to District Legal Services Authority support.',
    descKn: 'ಉಚಿತ ಕಾನೂನು ನೆರವು ಮತ್ತು ವಕೀಲರ ಸೇವೆ ಪಡೆಯಲು ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ.',
    tag: 'Free Legal Aid',
    tagKn: 'ಉಚಿತ ಕಾನೂನು ನೆರವು',
    steps: [
      {
        heading: 'What is DLSA?',
        headingKn: 'ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ (DLSA) ಎಂದರೆ ಏನು?',
        body: 'The District Legal Services Authority (DLSA) is a government body under the Legal Services Authorities Act, 1987. It provides FREE legal assistance to eligible citizens — including representation by a government-appointed lawyer, help filing court documents, and access to Lok Adalats.',
        bodyKn: 'ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರವು (DLSA) ೧೯೮೭ ರ ಕಾನೂನು ಸೇವಾ ಪ್ರಾಧಿಕಾರಗಳ ಕಾಯ್ದೆಯಡಿಯಲ್ಲಿ ಸರ್ಕಾರ ಸ್ಥಾಪಿಸಿದ ಸಂಸ್ಥೆಯಾಗಿದೆ. ಇದು ಅರ್ಹ ನಾಗರಿಕರಿಗೆ ಉಚಿತ ಕಾನೂನು ವಕೀಲರ ಸೇವೆ, ಕೋರ್ಟ್ ದಾಖಲೆ ಸಿದ್ಧತೆ ಮತ್ತು ಲೋಕ್ ಅದಾಲತ್ ಉಚಿತ ನ್ಯಾಯಸಮ್ಮತ ಪರಿಹಾರವನ್ನು ಒದಗಿಸುತ್ತದೆ.',
      },
      {
        heading: 'Who is eligible?',
        headingKn: 'ಉಚಿತ ಕಾನೂನು ನೆರವಿಗೆ ಯಾರು ಅರ್ಹರು?',
        body: `You are entitled to free legal aid if you are:\n• A woman or child\n• A member of SC/ST community\n• A person with disability\n• A victim of trafficking or mass disaster\n• An industrial workman\n• A person whose annual income is below ₹3 lakh (varies by state)\n• A person in custody or remand`,
        bodyKn: `ನೀವು ಈ ಕೆಳಗಿನ ವರ್ಗದಲ್ಲಿದ್ದರೆ ಉಚಿತ ಕಾನೂನು ನೆರವು ಪಡೆಯಬಹುದು:\n• ಮಹಿಳೆಯರು ಮತ್ತು ಮಕ್ಕಳು\n• ಪ ಪರಿಶಿಷ್ಟ ಜಾತಿ / ಪಂಗಡದ (SC/ST) ಸದಸ್ಯರು\n• ವಿಕಲಚೇತನರು\n• ದೌರ್ಜನ್ಯ ಅಥವಾ ದುರಂತಕ್ಕೆ ಒಳಗಾದ ಸಂತ್ರಸ್ತರು\n• ಕೈಗಾರಿಕಾ ಕಾರ್ಮಿಕರು\n• ವಾರ್ಷಿಕ ಆದಾಯ ₹೩ ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆಯಿರುವ ನಾಗರಿಕರು\n• ಕಸ್ಟಡಿ ಅಥವಾ ಕಾವಲಿನಲ್ಲಿರುವ ವ್ಯಕ್ತಿಗಳು`,
      },
      {
        heading: 'How to apply?',
        headingKn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ?',
        body: `1. Visit your District Court Complex — the DLSA office is located inside.\n2. Carry: Aadhaar card, income certificate (if available), any documents related to your case.\n3. Fill out the free legal aid application form.\n4. A Panel Lawyer will be assigned to represent you free of charge.\n5. You can also call the KSLSA helpline: 080-22111730`,
        bodyKn: `೧. ನಿಮ್ಮ ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯದ ಸಂಕೀರ್ಣಕ್ಕೆ (District Court Complex) ಭೇಟಿ ನೀಡಿ — DLSA ಕಚೇರಿ ಅಲ್ಲೇ ಇದೆ.\n೨. ಆಧಾರ್ ಕಾರ್ಡ್, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಪ್ರಕರಣಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ದಾಖಲೆಗಳನ್ನು ತನ್ನಿ.\n೩. ಉಚಿತ ಕಾನೂನು ನೆರವು ಅರ್ಜಿ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಿ.\n೪. ನಿಮಗಾಗಿ ಉಚಿತವಾಗಿ ವಾದಿಸಲು ಪ್ಯಾನಲ್ ವಕೀಲರನ್ನು (Panel Lawyer) ನೇಮಿಸಲಾಗುತ್ತದೆ.\n೫. ರಾಜ್ಯ ಕಾನೂನು ಸೇವಾ ಪ್ರಾಧಿಕಾರ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ: ೦೮೦-೨೨೧೧೧೭೩೦`,
      },
      {
        heading: 'Lok Adalats — fast-track settlements',
        headingKn: 'ಲೋಕ್ ಅದಾಲತ್ — ಶೀಘ್ರ ಮತ್ತು ಉಚಿತ ನ್ಯಾಯ',
        body: 'Lok Adalats are organised by the DLSA to settle disputes out of court. They are free, fast, and the award is final. Common cases resolved: motor accident claims, matrimonial disputes, labour disputes, cheque bounce cases.',
        bodyKn: 'ಲೋಕ್ ಅದಾಲತ್ ನ್ಯಾಯಾಲಯದ ಹೊರಗೆ ಶೀಘ್ರ ಮತ್ತು ಉಚಿತ ರಾಜಿ-ಸಂಧಾನಕ್ಕೆ ಉತ್ತಮ ವೇದಿಕೆಯಾಗಿದೆ. ಇಲ್ಲಿ ನೀಡಲಾಗುವ ತೀರ್ಮಾನ ಅಂತಿಮವಾಗಿರುತ್ತದೆ. ಮುಖ್ಯವಾಗಿ: ವಾಹನ ಅಪಘಾತ ಪರಿಹಾರ, ಕುಟುಂಬ ಕಲಹಗಳು, ಚೆಕ್ ಬೌನ್ಸ್ ಪ್ರಕರಣಗಳು ಮತ್ತು ಬಾಕಿ ವಸೂಲಿ ವಿವಾದಗಳನ್ನು ಇಲ್ಲಿ ಪರಿಹರಿಸಲಾಗುತ್ತದೆ.',
      },
    ],
    links: [
      { label: 'KSLSA Official Website', labelKn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕಾನೂನು ಸೇವಾ ಪ್ರಾಧಿಕಾರ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್', url: 'https://kslsa.kar.nic.in/' },
      { label: 'NALSA Free Legal Services', labelKn: 'ರಾಷ್ಟ್ರೀಯ ಉಚಿತ ಕಾನೂನು ಸೇವೆಗಳ ಪೋರ್ಟಲ್ (NALSA)', url: 'https://nalsa.gov.in/' },
    ],
    aiPrompt: 'Explain in detail how a Karnataka citizen can approach the District Legal Services Authority (DLSA) for free legal aid. Include eligibility criteria, the process, what documents to bring, and what Lok Adalats are.',
  },

  police: {
    icon: Shield,
    color: 'text-alertRed',
    title: 'Filing a Police Complaint',
    titleKn: 'ಪೋಲಿಸ್ ಠಾಣೆಯಲ್ಲಿ ದೂರು ಸಲ್ಲಿಸುವ ವಿಧಾನ (FIR)',
    desc: 'What details to collect before approaching a police station.',
    descKn: 'ಪೋಲಿಸ್ ಠಾಣೆಗೆ ಹೋಗುವ ಮೊದಲು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ಮುಖ್ಯ ಮಾಹಿತಿ.',
    tag: 'Criminal / Complaint',
    tagKn: 'ಕ್ರಿಮಿನಲ್ / ಪೊಲೀಸ್ ದೂರು',
    steps: [
      {
        heading: 'Before you go — collect these details',
        headingKn: 'ಠಾಣೆಗೆ ಹೋಗುವ ಮೊದಲು — ಈ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿ',
        body: `Write down and keep safe:\n• Date, time, and exact location of the incident\n• Names of accused (if known)\n• Names and contact numbers of witnesses\n• Photographs, screenshots, or videos as evidence\n• Any physical evidence (don't wash or clean)`,
        bodyKn: `ಈ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಬರೆದಿಟ್ಟುಕೊಳ್ಳಿ:\n• ಘಟನೆ ನಡೆದ ದಿನಾಂಕ, ಸಮಯ ಮತ್ತು ನಿಖರ ಸ್ಥಳ\n• ಆರೋಪಿಗಳ ಹೆಸರುಗಳು (ತಿಳಿದಿದ್ದರೆ)\n• ಸಾಕ್ಷಿಗಳ ಹೆಸರು ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ\n• ಸಾಕ್ಷ್ಯಾಧಾರಗಳು (ಫೋಟೋ, ವಾಟ್ಸಾಪ್ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಥವಾ ವೀಡಿಯೊ)\n• ಭೌತಿಕ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ`,
      },
      {
        heading: 'Types of police complaints',
        headingKn: 'ಪೊಲೀಸ್ ದೂರುಗಳ ಪ್ರಕಾರಗಳು',
        body: `• FIR (First Information Report): Filed for cognizable offences (theft, assault, murder, domestic violence). Police MUST register an FIR — they cannot refuse.\n• Written complaint: For non-cognizable offences. Police forward it to a magistrate.\n• Online complaint: Available on Karnataka Police website at ksp.karnataka.gov.in`,
        bodyKn: `• ಎಫ್‌ಐಆರ್ (FIR - ಪ್ರಥಮ ಮಾಹಿತಿ ವರದಿ): ಕಾಗ್ನಿಜೇಬಲ್ (ಗಂಭೀರ) ಅಪರಾಧಗಳಿಗೆ (ಕಳ್ಳತನ, ಹಲ್ಲೆ, ಗೃಹ ಹಿಂಸೆ). ಪೊಲೀಸರು ಕಡ್ಡಾಯವಾಗಿ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಬೇಕು.\n• ಲಿಖಿತ ದೂರು: ಸಣ್ಣ ವಿವಾದಗಳಿಗೆ ಠಾಣಾಧಿಕಾರಿಗೆ ಲಿಖಿತ ದೂರು ನೀಡಬಹುದು.\n• ಆನ್‌ಲೈನ್ ದೂರು: ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ವೆಬ್‌ಸೈಟ್ ksp.karnataka.gov.in ನಲ್ಲೂ ಉಚಿತ ದೂರು ಸಲ್ಲಿಸಬಹುದು.`,
      },
      {
        heading: 'If police refuse to register your FIR',
        headingKn: 'ಪೊಲೀಸರು ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಲು ನಿರಾಕರಿಸಿದರೆ ಏನು ಮಾಡಬೇಕು?',
        body: `Under Section 173(3) of BNSS 2023, if police refuse to register your FIR:\n1. Send a written complaint to the Superintendent of Police (SP) of the district.\n2. Approach the nearest Judicial Magistrate directly.\n3. Contact the Karnataka State Human Rights Commission.\n4. Call 112 and report the refusal.`,
        bodyKn: `ಬಿಎನ್‌ಎಸ್‌ಎಸ್ ೨೦೨೩ ರ ಕಾಯ್ದೆಯನ್ವಯ ಪೊಲೀಸರು ನಿರಾಕರಿಸಿದರೆ:\n೧. ಜಿಲ್ಲಾ ಪೊಲೀಸ್ ವರಿಷ್ಠಾಧಿಕಾರಿಗೆ (SP) ನೋಂದಾಯಿತ ಅಂಚೆ ಮೂಲಕ ದೂರು ಕಳುಹಿಸಿ.\n೨. ನ್ಯಾಯಾಲಯದ ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್‌ಗೆ ನೇರವಾಗಿ ದೂರು ಸಲ್ಲಿಸಿ.\n೩. ಮಾನವ ಹಕ್ಕುಗಳ ಆಯೋಗಕ್ಕೆ ದೂರು ನೀಡಿ.\n೪. ೧೧೨ ಗೆ ಕರೆ ಮಾಡಿ ಈ ವಿಷಯ ತಿಳಿಸಿ.`,
      },
      {
        heading: 'Women — special protections',
        headingKn: 'ಮಹಿಳೆಯರಿಗೆ ವಿಶೇಷ ಕಾನೂನು ರಕ್ಷಣೆ',
        body: `• Complaints related to rape, sexual assault, or domestic violence MUST be recorded by a female officer.\n• Call the Women Helpline (181) for immediate assistance.\n• One Stop Centres (Sakhi) can help you file complaints safely.`,
        bodyKn: `• ಮಹಿಳೆಯರ ಮೇಲಿನ ಲೈಂಗಿಕ ಕಿರುಕುಳ ಅಥವಾ ಗೃಹ ಹಿಂಸೆಯ ದೂರನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಮಹಿಳಾ ಅಧಿಕಾರಿಯೇ ದಾಖಲಿಸಬೇಕು.\n• ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ ೧೮೧ ಮಹಿಳಾ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ.\n• ಪ್ರತಿಯೊಂದು ಜಿಲ್ಲಾಸ್ಪತ್ರೆಯಲ್ಲಿರುವ ಸಖಿ ಒನ್ ಸ್ಟಾಪ್ ಸೆಂಟರ್ ಉಚಿತ ನೆರವು ನೀಡುತ್ತದೆ.`,
      },
    ],
    links: [
      { label: 'Karnataka Police Online Complaint', labelKn: 'ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಅಧಿಕೃತ ಆನ್‌ಲೈನ್ ದೂರು ಪೋರ್ಟಲ್', url: 'https://ksp.karnataka.gov.in/' },
      { label: 'National Emergency: 112', labelKn: 'ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸಹಾಯವಾಣಿ: ೧೧೨', url: 'tel:112' },
    ],
    aiPrompt: 'Explain step by step how a Karnataka citizen can file a police complaint including FIR, what to do if police refuse, and special protections for women under Indian law.',
  },

  women: {
    icon: Users,
    color: 'text-pink-600',
    title: 'Women & Child Safety',
    titleKn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಸುರಕ್ಷತಾ ರಕ್ಷಣೆ',
    desc: 'Emergency numbers, legal protections, and first-response routes.',
    descKn: 'ತುರ್ತು ಸಹಾಯವಾಣಿಗಳು, ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಸಂರಕ್ಷಣಾ ಕೇಂದ್ರಗಳು.',
    tag: 'Safety & Protection',
    tagKn: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಸಂರಕ್ಷಣೆ',
    steps: [
      {
        heading: 'Emergency contacts — save these now',
        headingKn: 'ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು — ಈಗಲೇ ಉಚಿತವಾಗಿ ಸಂಪರ್ಕಿಸಿ',
        body: `📞 112 — Police Emergency (24/7)\n📞 181 — Vanitha Sahayavani Women Helpline (Karnataka, free)\n📞 1098 — Childline (children in distress)\n📞 102 — Ambulance\n📞 1091 — Women in distress (national)\n📞 080-22111730 — KSLSA Legal Aid`,
        bodyKn: `📞 ೧೧೨ — ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಪೊಲೀಸ್ (೨೪/೭)\n📞 ೧೮೧ — ವನಿತಾ ಸಹಾಯವಾಣಿ (ಕರ್ನಾಟಕ, ಉಚಿತ)\n📞 ೧೦೯೮ — ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ (Childline)\n📞 ೧೦೨ — ಆಂಬ್ಯುಲೆನ್ಸ್\n📞 ೦೮೦-೨೨೧೧೧೭೩೦ — ರಾಜ್ಯ ಕಾನೂನು ನೆರವು`,
      },
      {
        heading: 'Laws protecting women in Karnataka',
        headingKn: 'ಮಹಿಳೆಯರ ಕಾನೂನು ಹಕ್ಕುಗಳು ಮತ್ತು ಕಾಯ್ದೆಗಳು',
        body: `• Protection of Women from Domestic Violence Act, 2005 — covers physical, emotional, sexual, economic abuse\n• Dowry Prohibition Act, 1961 — giving/taking dowry is a criminal offence\n• POCSO Act, 2012 — protection of children from sexual offences\n• BNS 2023, Section 85 — cruelty by husband or his relatives\n• Maternity Benefit Act — maternity leave and benefits for working women`,
        bodyKn: `• ಗೃಹ ಹಿಂಸೆ ತಡೆ ಕಾಯ್ದೆ ೨೦೦೫ — ಶಾರೀರಿಕ, ಮಾನಸಿಕ ಮತ್ತು ಹಣಕಾಸು ಕಿರುಕುಳದ ವಿರುದ್ಧ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ\n• ವರದಕ್ಷಿಣೆ ನಿಷೇಧ ಕಾಯ್ದೆ ೧೯೬೧ — ವರದಕ್ಷಿಣೆ ನೀಡುವುದು ಮತ್ತು ಕೇಳುವುದು ಶಿಕ್ಷಾರ್ಹ ಅಪರಾಧ\n• ಪೋಕ್ಸೋ (POCSO) ಕಾಯ್ದೆ ೨೦೧೨ — ಮಕ್ಕಳ ಮೇಲಿನ ದೌರ್ಜನ್ಯ ತಡೆ ರಕ್ಷಣೆ\n• ಹೆರಿಗೆ ಸೌಲಭ್ಯ ಕಾಯ್ದೆ — ಉದ್ಯೋಗಸ್ಥ ಮಹಿಳೆಯರಿಗೆ ಹೆರಿಗೆ ರಜೆ ಮತ್ತು ವೇತನ ಸೌಲಭ್ಯ`,
      },
      {
        heading: 'One Stop Centres (Sakhi)',
        headingKn: 'ಸಖಿ ಒನ್ ಸ್ಟಾಪ್ ಸೆಂಟರ್ (Sakhi One Stop Centre)',
        body: `Sakhi One Stop Centres are government facilities at district hospitals. They provide:\n• Shelter (up to 5 days)\n• Medical examination and treatment\n• Police assistance for filing FIR\n• Legal aid and court assistance\n• Psychological counselling\n\nNearest centre: Visit your district government hospital or call 181.`,
        bodyKn: `ಜಿಲ್ಲಾ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಸರ್ಕಾರಿ ಒನ್ ಸ್ಟಾಪ್ ಸೆಂಟರ್‌ಗಳು ಲಭ್ಯವಿವೆ. ಅಲ್ಲಿ ದೊರೆಯುವ ಸೇವೆಗಳು:\n• ಉಚಿತ ತಾತ್ಕಾಲಿಕ ವಸತಿ ಆಶ್ರಯ (೫ ದಿನಗಳವರೆಗೆ)\n• ಉಚಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ\n• ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಲು ಉಚಿತ ಪೋಲಿಸ್ ಸಹಾಯ\n• ಉಚಿತ ಕಾನೂನು ವಕೀಲರ ನೆರವು\n• ಮಾನಸಿಕ ಆಪ್ತಸಮಾಲೋಚನೆ (Counselling)`,
      },
      {
        heading: 'How to get a Protection Order',
        headingKn: 'ರಕ್ಷಣಾ ಆದೇಶ (Protection Order) ಪಡೆಯುವುದು ಹೇಗೆ?',
        body: `Under the Domestic Violence Act:\n1. Contact a Protection Officer (available at every district collectorate)\n2. File a Domestic Incident Report (DIR)\n3. The Magistrate can issue a Protection Order within 3 working days\n4. Violation of a Protection Order is punishable with jail and fine`,
        bodyKn: `ಗೃಹ ಹಿಂಸೆ ತಡೆ ಕಾಯ್ದೆಯಡಿ:\n೧. ಪ್ರತಿಯೊಂದು ಜಿಲ್ಲೆಯ ರಕ್ಷಣಾಧಿಕಾರಿಯನ್ನು (Protection Officer) ಸಂಪರ್ಕಿಸಿ.\n೨. ಗೃಹ ಹಿಂಸೆ ವರದಿ (DIR) ದಾಖಲಿಸಿ.\n೩. ಮ್ಯಾಜಿಸ್ಟ್ರೇಟ್ ನ್ಯಾಯಾಲಯವು ೩ ದಿನಗಳಲ್ಲಿ ರಕ್ಷಣಾ ಆದೇಶ ನೀಡುತ್ತದೆ.`,
      },
    ],
    links: [
      { label: 'Women Helpline (181)', labelKn: 'ವನಿತಾ ಸಹಾಯವಾಣಿ (೧೮೧)', url: 'tel:181' },
      { label: 'Karnataka WCD Department', labelKn: 'ಮಹಿಳಾ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ ಇಲಾಖೆ ಕರ್ನಾಟಕ', url: 'https://wcd.karnataka.gov.in/' },
    ],
    aiPrompt: 'Provide detailed information about laws protecting women and children in Karnataka, emergency contacts, One Stop Centres (Sakhi), and how to get a Protection Order under the Domestic Violence Act.',
  },

  consumer: {
    icon: ShoppingCart,
    color: 'text-blue-600',
    title: 'Consumer Complaint Basics',
    titleKn: 'ಗ್ರಾಹಕರ ಕುಂದುಕೊರತೆ ಮತ್ತು ಪರಿಹಾರ ದೂರು',
    desc: 'Documents and facts useful for consumer disputes in Karnataka.',
    descKn: 'ಕಳಪೆ ವಸ್ತುಗಳು ಅಥವಾ ಸೇವಾ ದೋಷದ ವಿರುದ್ಧ ಗ್ರಾಹಕ ಕೋರ್ಟ್‌ಗೆ ದೂರು ಸಲ್ಲಿಸುವ ವಿಧಾನ.',
    tag: 'Consumer Rights',
    tagKn: 'ಗ್ರಾಹಕರ ಹಕ್ಕುಗಳು',
    steps: [
      {
        heading: 'When can you file a consumer complaint?',
        headingKn: 'ನೀವು ಯಾವಾಗ ಗ್ರಾಹಕ ದೂರು ಸಲ್ಲಿಸಬಹುದು?',
        body: `You can file a complaint if you experienced:\n• Defective goods (product doesn't work as described)\n• Deficient services (bank, hospital, builder didn't deliver)\n• Overcharging or unfair trade practices\n• Misleading advertisements\n• Online fraud / e-commerce fraud (Flipkart, Amazon, etc.)`,
        bodyKn: `ಈ ಕೆಳಗಿನ ಸನ್ನಿವೇಶಗಳಲ್ಲಿ ದೂರು ಸಲ್ಲಿಸಬಹುದು:\n• ದೋಷಪೂರಿತ ವಸ್ತುಗಳು (ಖರೀದಿಸಿದ ವಸ್ತು ಕೆಲಸ ಮಾಡದಿದ್ದರೆ)\n• ಕಳಪೆ ಸೇವೆ (ಬ್ಯಾಂಕ್, ಆಸ್ಪತ್ರೆ, ಬಿಲ್ಡರ್ ಭರವಸೆ ನೀಡಿದ ಸೇವೆ ನೀಡದಿದ್ದರೆ)\n• ನಿಗದಿತ ಬೆಲೆಗಿಂತ ಹೆಚ್ಚು ಹಣ ವಸೂಲಿ ಮಾಡುವುದು\n• ಆನ್‌ಲೈನ್ ಇ-ಕಾಮರ್ಸ್ ವಂಚನೆ (Flipkart, Amazon ಇತ್ಯಾದಿ)`,
      },
      {
        heading: 'Documents to collect',
        headingKn: 'ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ದಾಖಲೆಗಳು',
        body: `Keep safe:\n• Original bill / invoice / receipt\n• Order confirmation email or SMS\n• Product warranty card\n• Photographs of defective goods\n• All written communication with the seller/company\n• Bank statement showing the transaction`,
        bodyKn: `ಈ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಿ:\n• ಅಸಲಿ ಬಿಲ್ / ಇನ್‌ವಾಯ್ಸ್ (Bill / Receipt)\n• ಆರ್ಡರ್ ದೃಢೀಕರಣದ ಇಮೇಲ್ ಅಥವಾ ಎಸ್‌ಎಂಎಸ್\n• ವಾರಂಟಿ ಕಾರ್ಡ್\n• ದೋಷಪೂರಿತ ವಸ್ತುವಿನ ಫೋಟೋಗಳು\n• ಕಂಪನಿ ಅಥವಾ ಮಾರಾಟಗಾರರೊಂದಿಗೆ ನಡೆಸಿದ ಸಂಭಾಷಣೆ`,
      },
      {
        heading: 'Where to file — jurisdiction',
        headingKn: 'ದೂರು ಸಲ್ಲಿಸುವ ನ್ಯಾಯಾಲಯಗಳ ವ್ಯಾಪ್ತಿ',
        body: `• Up to ₹50 lakh claim → District Consumer Disputes Redressal Commission (CDRC)\n• ₹50 lakh to ₹2 crore → State Consumer Commission, Bengaluru\n• Above ₹2 crore → National Consumer Disputes Redressal Commission, Delhi\n\n✅ Filing fee is free for claims up to ₹5 lakh.`,
        bodyKn: `• ₹೫೦ ಲಕ್ಷದವರೆಗಿನ ಪರಿಹಾರ ಧನ → ಜಿಲ್ಲಾ ಗ್ರಾಹಕರ ವಿವಾದ ಪರಿಹಾರ ಆಯೋಗ (CDRC)\n• ₹೫೦ ಲಕ್ಷದಿಂದ ₹೨ ಕೋಟಿಯವರೆಗೆ → ರಾಜ್ಯ ಗ್ರಾಹಕರ ಆಯೋಗ, ಬೆಂಗಳೂರು\n• ₹೫ ಲಕ್ಷದವರೆಗಿನ ದೂರುಗಳಿಗೆ ಕೋರ್ಟ್ ಫೀ ಉಚಿತವಾಗಿರುತ್ತದೆ.`,
      },
      {
        heading: 'How to file — step by step',
        headingKn: 'ದೂರು ಸಲ್ಲಿಸುವ ಹಂತಗಳು',
        body: `1. First, send a written complaint/legal notice to the company (keep a copy).\n2. If no response in 30 days, file a complaint at the CDRC.\n3. You can file online at: consumerhelpline.gov.in or edaakhil.nic.in\n4. You do NOT need a lawyer to file a consumer complaint.\n5. The commission must resolve your complaint within 90 days.`,
        bodyKn: `೧. ಮೊದಲು ಕಂಪನಿಗೆ ಲಿಖಿತ ದೂರು ಅಥವಾ ಲೀಗಲ್ ನೋಟೀಸ್ ಕಳುಹಿಸಿ.\n೨. ೩೦ ದಿನಗಳಲ್ಲಿ ಪರಿಹಾರ ಸಿಗದಿದ್ದರೆ ಗ್ರಾಹಕ ಆಯೋಗಕ್ಕೆ ದೂರು ಸಲ್ಲಿಸಿ.\n೩. ಇ-ದಾಖಿಲ್ (edaakhil.nic.in) ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಉಚಿತ ದೂರು ದಾಖಲಿಸಬಹುದು.\n೪. ಗ್ರಾಹಕ ದೂರು ಸಲ್ಲಿಸಲು ವಕೀಲರ ಅಗತ್ಯವಿರುವುದಿಲ್ಲ, ನೀವೇ ಸ್ವತಃ ವಾದಿಸಬಹುದು.`,
      },
    ],
    links: [
      { label: 'E-Daakhil Online Filing', labelKn: 'ಇ-ದಾಖಿಲ್ ಆನ್‌ಲೈನ್ ದೂರು ಪೋರ್ಟಲ್', url: 'https://edaakhil.nic.in/' },
      { label: 'National Consumer Helpline: 1800-11-4000', labelKn: 'ರಾಷ್ಟ್ರೀಯ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ: ೧೮೦೦-೧೧-೪೦೦೦', url: 'tel:18001144000' },
    ],
    aiPrompt: 'Explain how a Karnataka citizen can file a consumer complaint, including jurisdiction thresholds, required documents, online filing process, and what to do if a company refuses to respond.',
  },
};

export function ResourceCard({ resourceKey, data }) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [expanded, setExpanded] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const Icon = data.icon;

  const handleAskAI = async () => {
    if (aiContent) return;
    setAiLoading(true);
    try {
      const res = await legalApi.getLegalGuidance(data.aiPrompt);
      setAiContent(res.answer || res.guidance || JSON.stringify(res));
    } catch {
      setAiContent(isKn ? 'ಉತ್ತರ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು AI ಸಹಾಯಕ ಪುಟವನ್ನು ಪರೀಕ್ಷಿಸಿ.' : 'Could not retrieve AI response. Please try the AI Legal Guidance page.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm glass-panel transition-all duration-300 hover:border-legalGold overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-800">
              <Icon className={`h-6 w-6 ${data.color}`} />
            </div>
            <div>
              <span className="inline-block rounded-full bg-slate-100 dark:bg-navy-800 px-3 py-0.5 text-xs font-semibold text-legalGold">
                {isKn ? data.tagKn : data.tag}
              </span>
              <h2 className="mt-1 font-serif text-xl font-bold text-navy-900 dark:text-white">
                {isKn ? data.titleKn : data.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:border-legalGold transition-colors"
            aria-label="Toggle details"
            type="button"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {isKn ? data.descKn : data.desc}
        </p>

        {expanded && (
          <div className="mt-6 space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6 animate-scale-in">
            {data.steps.map((step, idx) => (
              <div key={idx} className="rounded-xl bg-slate-50 dark:bg-navy-950 p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-legalGold text-[11px] font-extrabold text-navy-950">
                    {idx + 1}
                  </span>
                  {isKn ? step.headingKn : step.heading}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line pl-7">
                  {isKn ? step.bodyKn : step.body}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              {data.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 px-3 py-1.5 text-xs font-semibold text-navy-900 dark:text-white hover:border-legalGold transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-legalGold" />
                  {isKn ? link.labelKn : link.label}
                </a>
              ))}
            </div>

            <div className="rounded-xl border border-legalGold/30 bg-legalGold/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-legalGold" />
                  {isKn ? 'AI ಹೆಚ್ಚಿನ ಸವಿಸ್ತಾರ ವಿವರಣೆ' : 'Ask AI for Extended Guidance'}
                </span>
                <button
                  onClick={handleAskAI}
                  disabled={aiLoading}
                  className="flex items-center gap-1 rounded bg-legalGold px-3 py-1 text-xs font-bold text-navy-950 disabled:opacity-50 hover:bg-yellow-400 transition-colors"
                  type="button"
                >
                  {aiLoading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {isKn ? 'ಪಡೆಯಲಾಗುತ್ತಿದೆ…' : 'Asking AI…'}</>
                  ) : (
                    <><RefreshCw className="h-3.5 w-3.5" /> {aiContent ? (isKn ? 'ಮತ್ತೆ ಕೇಳಿ' : 'Refresh') : (isKn ? 'AI ವಿವರಣೆ ಪಡೆಯಿರಿ' : 'Fetch AI Insights')}</>
                  )}
                </button>
              </div>
              {aiContent && (
                <p className="mt-3 text-xs leading-relaxed text-navy-900 dark:text-slate-200 border-t border-legalGold/20 pt-3 whitespace-pre-line">
                  {aiContent}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Resources() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <BookOpen className="h-3.5 w-3.5" /> {t('resources.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('resources.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('resources.desc')}
          </p>
        </div>
      </section>

      <section className="bg-surface dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {Object.entries(RESOURCE_CONTENT).map(([key, data]) => (
              <ResourceCard key={key} resourceKey={key} data={data} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
