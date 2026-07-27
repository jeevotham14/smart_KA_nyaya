import {
  BadgeHelp,
  Bot,
  Building2,
  FileText,
  Gavel,
  HeartHandshake,
  MapPinned,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export const services = [
  {
    title: 'AI Legal Guidance',
    description: 'Ask Kannada-English legal awareness questions and understand civil, criminal, family, and property issues.',
    icon: Bot,
    path: '/ai-legal-guidance',
  },
  {
    title: 'Women Protection',
    description: 'Safety information, emergency contacts, domestic violence help, and complaint guidance.',
    icon: ShieldAlert,
    path: '/women-protection',
  },
  {
    title: 'Free Legal Aid',
    description: 'Check likely eligibility and prepare basic legal aid application details.',
    icon: HeartHandshake,
    path: '/legal-aid',
  },
  {
    title: 'Document Assistance',
    description: 'Prepare complaint, petition, affidavit, legal aid, and vakalatnama draft placeholders.',
    icon: FileText,
    path: '/document-generator',
  },
  {
    title: 'Directory Locator',
    description: 'Find courts, DLSA, police stations, women police stations, NGOs, and shelters.',
    icon: MapPinned,
    path: '/directory',
  },
  {
    title: 'Case Tracking',
    description: 'Track legal aid or complaint requests with status timeline and notifications.',
    icon: BadgeHelp,
    path: '/case-tracker',
  },
];

export const karnatakaDistricts = {
  'Bagalkote': ['Badami', 'Bagalkote', 'Bilagi', 'Hunagunda', 'Ilkal', 'Jamakhandi', 'Mudhol', 'Rabkavi Banhatti', 'Guledgudda'],
  'Ballari': ['Ballari', 'Kurugodu', 'Kampli', 'Sandur', 'Siruguppa'],
  'Belagavi': ['Athani', 'Bailhongal', 'Belagavi', 'Chikkodi', 'Gokak', 'Hukkeri', 'Kagawad', 'Khanapur', 'Kittur', 'Mudalagi', 'Nippani', 'Raybag', 'Savadatti', 'Yaragatti'],
  'Bengaluru Rural': ['Devanahalli', 'Doddaballapura', 'Hoskote', 'Nelamangala'],
  'Bengaluru Urban': ['Anekal', 'Bengaluru East', 'Bengaluru North', 'Bengaluru South', 'Yelahanka'],
  'Bidar': ['Aurad', 'Basavakalyan', 'Bhalki', 'Bidar', 'Chitgoppa', 'Humnabad', 'Kamalnagar', 'Hulasur'],
  'Chamarajanagara': ['Chamarajanagara', 'Gundlupete', 'Hanur', 'Kollegala', 'Yelandur'],
  'Chikkaballapura': ['Bagepalli', 'Chikkaballapura', 'Chintamani', 'Gauribidanur', 'Gudibanda', 'Sidlaghatta', 'Chelur'],
  'Chikkamagaluru': ['Ajjamapura', 'Chikkamagaluru', 'Kadur', 'Koppa', 'Mudigere', 'Narasimharajapura', 'Sringeri', 'Tarikere', 'Kalas'],
  'Chitradurga': ['Challakere', 'Chitradurga', 'Hiriyur', 'Holalkere', 'Hosadurga', 'Molakalmuru'],
  'Dakshina Kannada': ['Bantwal', 'Belthangady', 'Kadaba', 'Mangaluru', 'Moodabidri', 'Puttur', 'Sullia', 'Mulki', 'Ullal'],
  'Davangere': ['Channagiri', 'Davangere', 'Harihara', 'Honnali', 'Jagalur', 'Nyamathi'],
  'Dharwad': ['Alnavar', 'Annigeri', 'Dharwad', 'Hubballi', 'Hubballi City', 'Kalghatgi', 'Kundgol', 'Navalgund'],
  'Gadag': ['Gadag', 'Gajendragad', 'Lakshmeshwar', 'Mundargi', 'Nargund', 'Ron', 'Shirhatti'],
  'Hassan': ['Alur', 'Arkalgud', 'Arsikere', 'Belur', 'Channarayapatna', 'Hassan', 'Holenarasipura', 'Sakleshpur'],
  'Haveri': ['Byadgi', 'Hangal', 'Haveri', 'Hirekerur', 'Ranebennur', 'Rattihalli', 'Savanur', 'Shiggaon'],
  'Kalaburagi': ['Afzalpur', 'Aland', 'Chincholi', 'Chitapur', 'Kalaburagi', 'Kamalapura', 'Sedam', 'Shahabad', 'Jewargi', 'Yadrami', 'Kalagi'],
  'Kodagu': ['Madikeri', 'Somwarpet', 'Virajpet', 'Ponnampet', 'Kushalnagar'],
  'Kolar': ['Bangarapet', 'KGF', 'Kolar', 'Malur', 'Mulbagal', 'Srinivaspur'],
  'Koppal': ['Gangawati', 'Kanakagiri', 'Karatagi', 'Koppal', 'Kushtagi', 'Yelburga'],
  'Mandya': ['Krishnarajpet', 'Maddur', 'Malavalli', 'Mandya', 'Nagamangala', 'Pandavapura', 'Shrirangapattana'],
  'Mysuru': ['Heggadadevankote', 'Hunsur', 'Krishnarajanagara', 'Mysuru', 'Nanjangud', 'Piriyapatna', 'Saligrama', 'T. Narasipura'],
  'Raichur': ['Devadurga', 'Lingsugur', 'Manvi', 'Maski', 'Raichur', 'Sindhanur', 'Sirwar'],
  'Ramanagara': ['Channapatna', 'Kanakapura', 'Magadi', 'Ramanagara', 'Harohalli'],
  'Shivamogga': ['Bhadravati', 'Hosanagara', 'Sagara', 'Shikaripura', 'Shivamogga', 'Soraba', 'Thirthahalli'],
  'Tumakuru': ['Chikkanayakanahalli', 'Gubbi', 'Koratagere', 'Kunigal', 'Madhugiri', 'Pavagada', 'Sira', 'Tiptur', 'Tumakuru', 'Turuvekere'],
  'Udupi': ['Brahmavara', 'Byndoor', 'Hebri', 'Karkala', 'Kaup', 'Kundapura', 'Udupi'],
  'Uttara Kannada': ['Ankola', 'Bhatkal', 'Dandeli', 'Haliyal', 'Honnavar', 'Joida', 'Karwar', 'Kumta', 'Mundgod', 'Siddapur', 'Sirsi', 'Yellapur'],
  'Vijayapura': ['Basavana Bagevadi', 'Bijapur', 'Indi', 'Muddebihal', 'Sindagi', 'Chadchan', 'Tikota', 'Bableshwar', 'Kolhar', 'Nidagundi', 'Devara Hippargi', 'Talikota'],
  'Yadgir': ['Gurmitkal', 'Hunasagi', 'Shahapur', 'Shorapur', 'Vadagera', 'Yadgir'],
  'Vijayanagara': ['Harapanahalli', 'Hoovina Hadagali', 'Hagaribommanahalli', 'Kotturu', 'Kudligi', 'Hosapete']
};

export const legalCategories = [
  {
    title: 'Family law',
    prompt: 'My spouse is refusing maintenance and I need to understand my legal options in Karnataka.',
    examples: ['Maintenance', 'Domestic violence', 'Child custody'],
  },
  {
    title: 'Property',
    prompt: 'There is a dispute about inherited property records and I need guidance on first steps.',
    examples: ['Partition', 'Khata issue', 'Sale deed concern'],
  },
  {
    title: 'Labour',
    prompt: 'My employer has not paid wages and I want to know where to complain in Karnataka.',
    examples: ['Unpaid wages', 'Termination', 'Workplace harassment'],
  },
  {
    title: 'Consumer',
    prompt: 'A shop or service provider cheated me and I want to understand consumer complaint options.',
    examples: ['Defective goods', 'Refund issue', 'Service deficiency'],
  },
  {
    title: 'Criminal complaint',
    prompt: 'I need help understanding how to prepare basic details for a police complaint.',
    examples: ['FIR basics', 'Threats', 'Lost documents'],
  },
  {
    title: 'Women safety',
    prompt: 'I need urgent safety and protection guidance for harassment or domestic violence.',
    examples: ['181 helpline', 'Protection order', 'Women police station'],
  },
];

export const assistantResponses = {
  'Family law': [
    'Write down dates, incidents, names, and any documents or messages related to the issue.',
    'For maintenance, domestic violence, or custody concerns, you may approach the appropriate family court, protection officer, DLSA, TLSC, or a qualified advocate.',
    'If there is immediate danger, call 112. Women in distress can also call 181.',
  ],
  Property: [
    'Collect property documents such as RTC, khata, sale deed, partition deed, tax receipts, and family relationship records.',
    'For record corrections, start with the local revenue office. For ownership disputes, consult an advocate or DLSA/TLSC before filing.',
    'Avoid signing any settlement or transfer document without understanding its legal effect.',
  ],
  Labour: [
    'Keep appointment letters, wage slips, attendance records, messages, and bank statements showing unpaid salary or employment terms.',
    'Depending on the issue, the labour department, labour court, legal services authority, or an advocate may guide the formal process.',
    'If the issue involves harassment or safety, preserve evidence and seek urgent local support.',
  ],
  Consumer: [
    'Save invoices, warranty cards, payment proof, photographs, emails, and complaint messages.',
    'You can first send a written complaint to the seller or service provider, then consider consumer commission options if unresolved.',
    'Check limitation periods and claim value before choosing the correct forum.',
  ],
  'Criminal complaint': [
    'Prepare a clear chronology: what happened, when, where, who was involved, witnesses, and available evidence.',
    'For immediate danger or ongoing offence, call 112 or approach the nearest police station.',
    'For formal legal strategy, consult an advocate, DLSA, TLSC, or appropriate authority.',
  ],
  'Women safety': [
    'If there is immediate danger, call 112 first. For women support, call 181.',
    'Preserve messages, call logs, photographs, medical records, and witness details where safe to do so.',
    'You may seek help from women police station, protection officer, DLSA/TLSC, shelter home, or a qualified advocate.',
  ],
};

export const womenSupportCenters = [
  { name: 'Bengaluru Women Police Station', district: 'Bengaluru Urban', phone: '080-2294 3210', distance: '3.2 km' },
  { name: 'Mysuru One Stop Centre', district: 'Mysuru', phone: '0821-241 8110', distance: '5.8 km' },
  { name: 'Dharwad Women Help Desk', district: 'Dharwad', phone: '0836-223 3444', distance: '8.1 km' },
];

export const documentTemplates = {
  Complaint: {
    heading: 'Police Complaint Draft',
    request: 'I request the concerned police authority to receive this complaint and take action as per law.',
  },
  'Petition draft': {
    heading: 'Petition Draft',
    request: 'I request the competent court or authority to consider the facts and grant appropriate relief.',
  },
  'Legal aid application': {
    heading: 'Legal Aid Application Draft',
    request: 'I request free legal aid assistance through the appropriate Legal Services Authority.',
  },
  'Vakalatnama placeholder': {
    heading: 'Vakalatnama Placeholder',
    request: 'This is a placeholder draft and must be finalized by a qualified advocate before use.',
  },
  'Affidavit draft': {
    heading: 'Affidavit Draft',
    request: 'I state that the facts mentioned above are true to the best of my knowledge and belief.',
  },
};

export const directoryItems = [
  { name: 'Bengaluru Urban DLSA', type: 'DLSA', district: 'Bengaluru Urban', contact: '080-2211 2900' },
  { name: 'Mysuru District Court', type: 'Court', district: 'Mysuru', contact: '0821-242 2100' },
  { name: 'Women Police Station, Hubballi', type: 'Women Police Station', district: 'Dharwad', contact: '0836-223 3444' },
  { name: 'Legal Aid Clinic, Kalaburagi', type: 'NGO', district: 'Kalaburagi', contact: '08472-265 010' },
];

export const dashboardCards = [
  { label: 'Recent legal queries', value: '12', icon: Gavel, tone: 'navy' },
  { label: 'Complaints / requests', value: '4', icon: ShieldAlert, tone: 'red' },
  { label: 'Generated documents', value: '7', icon: FileText, tone: 'gold' },
  { label: 'Legal aid applications', value: '3', icon: UserCheck, tone: 'green' },
];

export const adminStats = [
  { label: 'Registered users', value: '2,480', icon: UserCheck, tone: 'navy' },
  { label: 'Open complaints', value: '138', icon: ShieldAlert, tone: 'red' },
  { label: 'Directory entries', value: '624', icon: Building2, tone: 'gold' },
  { label: 'Legal aid cases', value: '419', icon: HeartHandshake, tone: 'green' },
];

export const timeline = [
  'Request submitted',
  'Documents received',
  'District desk review',
  'Authority response pending',
];
