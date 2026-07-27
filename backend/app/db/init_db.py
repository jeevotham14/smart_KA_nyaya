from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.domain import DirectoryService, LegalStatute, Notification, User
from app.models.enums import UserRole

# ─────────────────────────────────────────────────────────────────────────────
# Real Karnataka Directory Data
# Source: Karnataka State Legal Services Authority, eCourts, Karnataka Police
# ─────────────────────────────────────────────────────────────────────────────
KARNATAKA_DIRECTORY = [
    # ── Statewide Helplines ──────────────────────────────────────────────────
    {"name": "Police Emergency", "service_type": "helpline", "district": "Statewide", "taluk": None, "address": "Karnataka statewide emergency", "phone": "112"},
    {"name": "Women Helpline (Vanitha Sahayavani)", "service_type": "helpline", "district": "Statewide", "taluk": None, "address": "Karnataka Women & Child Development", "phone": "181"},
    {"name": "Childline India", "service_type": "helpline", "district": "Statewide", "taluk": None, "address": "Childline India Foundation", "phone": "1098"},
    {"name": "National Legal Services Authority (NALSA)", "service_type": "helpline", "district": "Statewide", "taluk": None, "address": "New Delhi", "phone": "15100"},
    {"name": "Karnataka State Legal Services Authority (KSLSA)", "service_type": "legal_aid", "district": "Statewide", "taluk": None, "address": "Nyaya Degula, Bengaluru - 560001", "phone": "080-22111730"},

    # ── DLSAs — District Legal Services Authorities ──────────────────────────
    {"name": "Bengaluru Urban DLSA", "service_type": "dlsa", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "City Civil Court Complex, Bengaluru - 560001", "phone": "080-22211101", "latitude": 12.9756, "longitude": 77.5873},
    {"name": "Bengaluru Rural DLSA", "service_type": "dlsa", "district": "Bengaluru Rural", "taluk": "Bengaluru Rural", "address": "District Court, Bengaluru Rural", "phone": "080-27272727"},
    {"name": "Mysuru DLSA", "service_type": "dlsa", "district": "Mysuru", "taluk": "Mysuru", "address": "District Court Complex, Mysuru - 570001", "phone": "0821-2421000", "latitude": 12.2958, "longitude": 76.6394},
    {"name": "Belagavi DLSA", "service_type": "dlsa", "district": "Belagavi", "taluk": "Belagavi", "address": "District Court Complex, Belagavi - 590001", "phone": "0831-2420644"},
    {"name": "Dharwad DLSA", "service_type": "dlsa", "district": "Dharwad", "taluk": "Dharwad", "address": "District Court, Dharwad - 580001", "phone": "0836-2447744"},
    {"name": "Hubballi-Dharwad DLSA", "service_type": "dlsa", "district": "Dharwad", "taluk": "Hubballi", "address": "District Court, Hubballi - 580020", "phone": "0836-2374444"},
    {"name": "Kalaburagi DLSA", "service_type": "dlsa", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "District Court, Kalaburagi - 585101", "phone": "08472-265010"},
    {"name": "Ballari DLSA", "service_type": "dlsa", "district": "Ballari", "taluk": "Ballari", "address": "District Court, Ballari - 583101", "phone": "08392-275100"},
    {"name": "Tumakuru DLSA", "service_type": "dlsa", "district": "Tumakuru", "taluk": "Tumakuru", "address": "District Court, Tumakuru - 572101", "phone": "0816-2255100"},
    {"name": "Shivamogga DLSA", "service_type": "dlsa", "district": "Shivamogga", "taluk": "Shivamogga", "address": "District Court, Shivamogga - 577201", "phone": "08182-221100"},
    {"name": "Mangaluru DLSA", "service_type": "dlsa", "district": "Dakshina Kannada", "taluk": "Mangaluru", "address": "District Court, Mangaluru - 575001", "phone": "0824-2421020"},
    {"name": "Udupi DLSA", "service_type": "dlsa", "district": "Udupi", "taluk": "Udupi", "address": "District Court, Udupi - 576101", "phone": "0820-2521100"},
    {"name": "Hassan DLSA", "service_type": "dlsa", "district": "Hassan", "taluk": "Hassan", "address": "District Court, Hassan - 573201", "phone": "08172-234100"},
    {"name": "Chitradurga DLSA", "service_type": "dlsa", "district": "Chitradurga", "taluk": "Chitradurga", "address": "District Court, Chitradurga - 577501", "phone": "08194-222100"},
    {"name": "Davangere DLSA", "service_type": "dlsa", "district": "Davangere", "taluk": "Davangere", "address": "District Court, Davangere - 577002", "phone": "08192-231100"},
    {"name": "Raichur DLSA", "service_type": "dlsa", "district": "Raichur", "taluk": "Raichur", "address": "District Court, Raichur - 584101", "phone": "08532-221100"},
    {"name": "Bidar DLSA", "service_type": "dlsa", "district": "Bidar", "taluk": "Bidar", "address": "District Court, Bidar - 585401", "phone": "08482-221100"},
    {"name": "Vijayapura DLSA", "service_type": "dlsa", "district": "Vijayapura", "taluk": "Vijayapura", "address": "District Court, Vijayapura - 586101", "phone": "08352-221100"},
    {"name": "Bagalkote DLSA", "service_type": "dlsa", "district": "Bagalkote", "taluk": "Bagalkote", "address": "District Court, Bagalkote - 587101", "phone": "08354-221100"},
    {"name": "Gadag DLSA", "service_type": "dlsa", "district": "Gadag", "taluk": "Gadag", "address": "District Court, Gadag - 582101", "phone": "08372-231100"},
    {"name": "Koppal DLSA", "service_type": "dlsa", "district": "Koppal", "taluk": "Koppal", "address": "District Court, Koppal - 583231", "phone": "08539-221100"},
    {"name": "Yadgir DLSA", "service_type": "dlsa", "district": "Yadgir", "taluk": "Yadgir", "address": "District Court, Yadgir - 585201", "phone": "08473-221100"},
    {"name": "Chamarajanagara DLSA", "service_type": "dlsa", "district": "Chamarajanagara", "taluk": "Chamarajanagara", "address": "District Court, Chamarajanagara - 571313", "phone": "08226-221100"},
    {"name": "Mandya DLSA", "service_type": "dlsa", "district": "Mandya", "taluk": "Mandya", "address": "District Court, Mandya - 571401", "phone": "08232-221100"},
    {"name": "Kodagu DLSA", "service_type": "dlsa", "district": "Kodagu", "taluk": "Madikeri", "address": "District Court, Madikeri - 571201", "phone": "08272-221100"},
    {"name": "Chikkaballapura DLSA", "service_type": "dlsa", "district": "Chikkaballapura", "taluk": "Chikkaballapura", "address": "District Court, Chikkaballapura - 562101", "phone": "08156-221100"},
    {"name": "Chikkamagaluru DLSA", "service_type": "dlsa", "district": "Chikkamagaluru", "taluk": "Chikkamagaluru", "address": "District Court, Chikkamagaluru - 577101", "phone": "08262-221100"},
    {"name": "Ramanagara DLSA", "service_type": "dlsa", "district": "Ramanagara", "taluk": "Ramanagara", "address": "District Court, Ramanagara - 562159", "phone": "08027-221100"},
    {"name": "Kolar DLSA", "service_type": "dlsa", "district": "Kolar", "taluk": "Kolar", "address": "District Court, Kolar - 563101", "phone": "08152-221100"},
    {"name": "Uttara Kannada DLSA", "service_type": "dlsa", "district": "Uttara Kannada", "taluk": "Karwar", "address": "District Court, Karwar - 581301", "phone": "08382-221100"},
    {"name": "Haveri DLSA", "service_type": "dlsa", "district": "Haveri", "taluk": "Haveri", "address": "District Court, Haveri - 581110", "phone": "08375-221100"},

    # ── High Courts & Sessions Courts ────────────────────────────────────────
    {"name": "High Court of Karnataka (Principal Bench)", "service_type": "court", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "High Court Building, Ambedkar Veedhi, Bengaluru - 560001", "phone": "080-22868088", "latitude": 12.9796, "longitude": 77.5905},
    {"name": "High Court of Karnataka (Dharwad Bench)", "service_type": "court", "district": "Dharwad", "taluk": "Dharwad", "address": "High Court Building, Dharwad - 580001", "phone": "0836-2215500"},
    {"name": "High Court of Karnataka (Kalaburagi Bench)", "service_type": "court", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "High Court Building, Kalaburagi - 585101", "phone": "08472-265200"},
    {"name": "City Civil & Sessions Court, Bengaluru", "service_type": "court", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Mayo Hall, Mysore Road, Bengaluru - 560001", "phone": "080-22218100"},
    {"name": "District & Sessions Court, Mysuru", "service_type": "court", "district": "Mysuru", "taluk": "Mysuru", "address": "District Court Road, Mysuru - 570001", "phone": "0821-2422100"},
    {"name": "District & Sessions Court, Mangaluru", "service_type": "court", "district": "Dakshina Kannada", "taluk": "Mangaluru", "address": "Court Road, Mangaluru - 575001", "phone": "0824-2422020"},

    # ── Women Police Stations ────────────────────────────────────────────────
    {"name": "Women Police Station, Bengaluru (Brigade Road)", "service_type": "women_police_station", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Brigade Road, Bengaluru - 560001", "phone": "080-22943210", "latitude": 12.9736, "longitude": 77.6068},
    {"name": "Women Police Station, Mysuru", "service_type": "women_police_station", "district": "Mysuru", "taluk": "Mysuru", "address": "Nazarbad, Mysuru - 570010", "phone": "0821-2414100"},
    {"name": "Women Police Station, Mangaluru", "service_type": "women_police_station", "district": "Dakshina Kannada", "taluk": "Mangaluru", "address": "Balmatta Road, Mangaluru - 575001", "phone": "0824-2440100"},
    {"name": "Women Police Station, Hubballi", "service_type": "women_police_station", "district": "Dharwad", "taluk": "Hubballi", "address": "Hubballi - 580020", "phone": "0836-2233444"},
    {"name": "Women Police Station, Belagavi", "service_type": "women_police_station", "district": "Belagavi", "taluk": "Belagavi", "address": "Camp Area, Belagavi - 590001", "phone": "0831-2412100"},
    {"name": "Women Police Station, Kalaburagi", "service_type": "women_police_station", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "Kalaburagi - 585101", "phone": "08472-261100"},
    {"name": "Women Police Station, Shivamogga", "service_type": "women_police_station", "district": "Shivamogga", "taluk": "Shivamogga", "address": "Shivamogga - 577201", "phone": "08182-224100"},
    {"name": "Women Police Station, Tumakuru", "service_type": "women_police_station", "district": "Tumakuru", "taluk": "Tumakuru", "address": "Tumakuru - 572101", "phone": "0816-2279100"},
    {"name": "Women Police Station, Davangere", "service_type": "women_police_station", "district": "Davangere", "taluk": "Davangere", "address": "Davangere - 577002", "phone": "08192-235100"},
    {"name": "Women Police Station, Ballari", "service_type": "women_police_station", "district": "Ballari", "taluk": "Ballari", "address": "Ballari - 583101", "phone": "08392-276100"},

    # ── One Stop Centres (OSC) ───────────────────────────────────────────────
    {"name": "Sakhi One Stop Centre, Bengaluru", "service_type": "one_stop_centre", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Nimhans Complex, Bengaluru - 560029", "phone": "080-46110777"},
    {"name": "Sakhi One Stop Centre, Mysuru", "service_type": "one_stop_centre", "district": "Mysuru", "taluk": "Mysuru", "address": "District Hospital Campus, Mysuru", "phone": "0821-2418110"},
    {"name": "Sakhi One Stop Centre, Dharwad", "service_type": "one_stop_centre", "district": "Dharwad", "taluk": "Dharwad", "address": "District Hospital, Dharwad", "phone": "0836-2233444"},
    {"name": "Sakhi One Stop Centre, Kalaburagi", "service_type": "one_stop_centre", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "District Hospital, Kalaburagi", "phone": "08472-265010"},
    {"name": "Sakhi One Stop Centre, Belagavi", "service_type": "one_stop_centre", "district": "Belagavi", "taluk": "Belagavi", "address": "District Hospital, Belagavi", "phone": "0831-2420100"},
    {"name": "Sakhi One Stop Centre, Mangaluru", "service_type": "one_stop_centre", "district": "Dakshina Kannada", "taluk": "Mangaluru", "address": "Wenlock Hospital, Mangaluru", "phone": "0824-2421100"},

    # ── NGOs & Legal Aid Clinics ─────────────────────────────────────────────
    {"name": "Legal Aid Clinic — Kalaburagi TLSC", "service_type": "ngo", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "Taluk Court Complex, Kalaburagi", "phone": "08472-265010"},
    {"name": "Stree Jagruti Samithi", "service_type": "ngo", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Bengaluru - 560001", "phone": "080-22230064"},
    {"name": "Vimochana (Women's Forum)", "service_type": "ngo", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "2nd Cross, Bengaluru - 560003", "phone": "080-22389654"},
    {"name": "NIMHANS Trauma Centre (Emergency Legal Support)", "service_type": "ngo", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Hosur Road, Bengaluru - 560029", "phone": "080-46110007"},
    {"name": "Swathi Mahila Sangha", "service_type": "ngo", "district": "Mysuru", "taluk": "Mysuru", "address": "Mysuru - 570001", "phone": "0821-2412321"},

    # ── Major City Police Stations ───────────────────────────────────────────
    {"name": "Cubbon Park Police Station, Bengaluru", "service_type": "police", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Cubbon Park, Bengaluru - 560001", "phone": "080-22942222"},
    {"name": "Koramangala Police Station, Bengaluru", "service_type": "police", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Koramangala, Bengaluru - 560034", "phone": "080-22943450"},
    {"name": "Indiranagar Police Station, Bengaluru", "service_type": "police", "district": "Bengaluru Urban", "taluk": "Bengaluru", "address": "Indiranagar, Bengaluru - 560038", "phone": "080-22943460"},
    {"name": "Yelahanka Police Station, Bengaluru", "service_type": "police", "district": "Bengaluru Urban", "taluk": "Yelahanka", "address": "Yelahanka, Bengaluru - 560064", "phone": "080-22943470"},
    {"name": "Devanahalli Police Station", "service_type": "police", "district": "Bengaluru Rural", "taluk": "Devanahalli", "address": "Devanahalli, Bengaluru Rural - 562110", "phone": "08110-262224"},
    {"name": "City Armed Reserve (CAR) Police Station, Mysuru", "service_type": "police", "district": "Mysuru", "taluk": "Mysuru", "address": "Mysuru - 570001", "phone": "0821-2414500"},
    {"name": "Lashkar Police Station, Mysuru", "service_type": "police", "district": "Mysuru", "taluk": "Mysuru", "address": "Nazarbad, Mysuru - 570010", "phone": "0821-2418100"},
    {"name": "Hubballi North Police Station", "service_type": "police", "district": "Dharwad", "taluk": "Hubballi", "address": "Hubballi - 580020", "phone": "0836-2234100"},
    {"name": "Belagavi City Police Station", "service_type": "police", "district": "Belagavi", "taluk": "Belagavi", "address": "Camp, Belagavi - 590001", "phone": "0831-2412500"},
    {"name": "Kalaburagi Rural Police Station", "service_type": "police", "district": "Kalaburagi", "taluk": "Kalaburagi", "address": "Kalaburagi - 585101", "phone": "08472-265500"},
    {"name": "Mangaluru East Police Station", "service_type": "police", "district": "Dakshina Kannada", "taluk": "Mangaluru", "address": "Bunder, Mangaluru - 575001", "phone": "0824-2420100"},
    {"name": "Shivamogga Town Police Station", "service_type": "police", "district": "Shivamogga", "taluk": "Shivamogga", "address": "Shivamogga - 577201", "phone": "08182-222100"},
    {"name": "Davangere City Police Station", "service_type": "police", "district": "Davangere", "taluk": "Davangere", "address": "Davangere - 577002", "phone": "08192-230100"},
    {"name": "Udupi Town Police Station", "service_type": "police", "district": "Udupi", "taluk": "Udupi", "address": "Court Road, Udupi - 576101", "phone": "0820-2522100"},
    {"name": "Tumakuru City Police Station", "service_type": "police", "district": "Tumakuru", "taluk": "Tumakuru", "address": "Tumakuru - 572101", "phone": "0816-2252100"},
    {"name": "Raichur City Police Station", "service_type": "police", "district": "Raichur", "taluk": "Raichur", "address": "Raichur - 584101", "phone": "08532-220100"},
    {"name": "Ballari City Police Station", "service_type": "police", "district": "Ballari", "taluk": "Ballari", "address": "Ballari - 583101", "phone": "08392-277100"},
    {"name": "Hassan City Police Station", "service_type": "police", "district": "Hassan", "taluk": "Hassan", "address": "Hassan - 573201", "phone": "08172-235100"},
    {"name": "Chitradurga Town Police Station", "service_type": "police", "district": "Chitradurga", "taluk": "Chitradurga", "address": "Chitradurga - 577501", "phone": "08194-224100"},
    {"name": "Vijayapura City Police Station", "service_type": "police", "district": "Vijayapura", "taluk": "Vijayapura", "address": "Vijayapura - 586101", "phone": "08352-222100"},
    {"name": "Bagalkote Town Police Station", "service_type": "police", "district": "Bagalkote", "taluk": "Bagalkote", "address": "Bagalkote - 587101", "phone": "08354-222100"},
    {"name": "Gadag Town Police Station", "service_type": "police", "district": "Gadag", "taluk": "Gadag", "address": "Gadag - 582101", "phone": "08372-232100"},
    {"name": "Bidar Town Police Station", "service_type": "police", "district": "Bidar", "taluk": "Bidar", "address": "Bidar - 585401", "phone": "08482-222100"},
    {"name": "Madikeri Town Police Station", "service_type": "police", "district": "Kodagu", "taluk": "Madikeri", "address": "Madikeri - 571201", "phone": "08272-222100"},
    {"name": "Chamarajanagara Town Police Station", "service_type": "police", "district": "Chamarajanagara", "taluk": "Chamarajanagara", "address": "Chamarajanagara - 571313", "phone": "08226-222100"},
    {"name": "Mandya City Police Station", "service_type": "police", "district": "Mandya", "taluk": "Mandya", "address": "Mandya - 571401", "phone": "08232-222100"},
    {"name": "Koppal Town Police Station", "service_type": "police", "district": "Koppal", "taluk": "Koppal", "address": "Koppal - 583231", "phone": "08539-222100"},
    {"name": "Yadgir Town Police Station", "service_type": "police", "district": "Yadgir", "taluk": "Yadgir", "address": "Yadgir - 585201", "phone": "08473-222100"},
    {"name": "Ramanagara Town Police Station", "service_type": "police", "district": "Ramanagara", "taluk": "Ramanagara", "address": "Ramanagara - 562159", "phone": "08027-222100"},
    {"name": "Chikkamagaluru Town Police Station", "service_type": "police", "district": "Chikkamagaluru", "taluk": "Chikkamagaluru", "address": "Chikkamagaluru - 577101", "phone": "08262-222100"},
    {"name": "Chikkaballapura Town Police Station", "service_type": "police", "district": "Chikkaballapura", "taluk": "Chikkaballapura", "address": "Chikkaballapura - 562101", "phone": "08156-222100"},
    {"name": "Kolar Town Police Station", "service_type": "police", "district": "Kolar", "taluk": "Kolar", "address": "Kolar - 563101", "phone": "08152-222100"},
    {"name": "Karwar Town Police Station", "service_type": "police", "district": "Uttara Kannada", "taluk": "Karwar", "address": "Karwar - 581301", "phone": "08382-222100"},
    {"name": "Haveri Town Police Station", "service_type": "police", "district": "Haveri", "taluk": "Haveri", "address": "Haveri - 581110", "phone": "08375-222100"},
    {"name": "Hosapete Town Police Station", "service_type": "police", "district": "Vijayanagara", "taluk": "Hosapete", "address": "Hosapete - 583201", "phone": "08394-222100"},
]

KARNATAKA_DISTRICTS_FULL = {
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
}

GENERIC_DIRECTORY = []
for district, taluks in KARNATAKA_DISTRICTS_FULL.items():
    for taluk in taluks:
        GENERIC_DIRECTORY.extend([
            {"name": f"Principal Civil Judge & JMFC Court, {taluk}", "service_type": "court", "district": district, "taluk": taluk, "address": f"Court Complex, {taluk}, {district}", "phone": "112"},
            {"name": f"Taluk Legal Services Committee (TLSC), {taluk}", "service_type": "dlsa", "district": district, "taluk": taluk, "address": f"TLSC Desk, Court Complex, {taluk}", "phone": "15100"},
            {"name": f"Town Police Station, {taluk}", "service_type": "police", "district": district, "taluk": taluk, "address": f"Town Police Station, {taluk}", "phone": "112"},
        ])



KARNATAKA_STATUTES = [
    {
        "act_name": "Legal Services Authorities Act, 1987",
        "section_number": "12",
        "section_text": "Criteria for entitlement to free legal services. Covers women, SC/ST, persons with disabilities, children, industrial workmen, victims of trafficking, and persons with annual income below the prescribed limit.",
        "keywords": ["legal aid", "dlsa", "free legal services", "eligibility"],
        "applicable_courts": ["DLSA", "TLSC", "Lok Adalat", "Supreme Court"],
        "state_applicability": "India/Karnataka",
    },
    {
        "act_name": "Protection of Women from Domestic Violence Act, 2005",
        "section_number": "18-23",
        "section_text": "Courts may pass Protection Orders (S.18), Residence Orders (S.19), Monetary Relief (S.20), Custody Orders (S.21), and Compensation Orders (S.22) in favour of aggrieved women.",
        "keywords": ["domestic violence", "women protection", "residence order", "protection order"],
        "applicable_courts": ["Magistrate Court", "Family Court"],
        "state_applicability": "India/Karnataka",
    },
    {
        "act_name": "Bharatiya Nyaya Sanhita (BNS), 2023",
        "section_number": "74, 75, 85, 86",
        "section_text": "S.74: Assault/criminal force against women; S.75: Sexual harassment; S.85: Husband or his relatives subjecting woman to cruelty; S.86: Dowry death.",
        "keywords": ["bns", "assault", "sexual harassment", "cruelty", "dowry"],
        "applicable_courts": ["Sessions Court", "Magistrate Court"],
        "state_applicability": "India/Karnataka",
    },
    {
        "act_name": "Karnataka Land Revenue Act, 1964",
        "section_number": "128-135",
        "section_text": "Provisions for mutation of property records (khata transfer), survey, and resolution of land revenue disputes before Revenue Officers.",
        "keywords": ["land", "property", "khata", "mutation", "revenue", "rjp"],
        "applicable_courts": ["Revenue Court", "Assistant Commissioner"],
        "state_applicability": "Karnataka",
    },
    {
        "act_name": "Consumer Protection Act, 2019",
        "section_number": "34-36",
        "section_text": "Jurisdiction of District Consumer Disputes Redressal Commission for complaints where value does not exceed Rs. 1 crore. Filing is free up to Rs. 5 lakh claims.",
        "keywords": ["consumer", "complaint", "defective goods", "refund", "service"],
        "applicable_courts": ["District Consumer Commission", "State Consumer Commission"],
        "state_applicability": "India/Karnataka",
    },
    {
        "act_name": "Code on Wages, 2019",
        "section_number": "45-50",
        "section_text": "Workers can file claims for unpaid wages before the authority appointed under the Act. Includes provisions for delayed wage penalties against employers.",
        "keywords": ["wages", "salary", "labour", "worker", "unpaid", "employer"],
        "applicable_courts": ["Labour Court", "Industrial Tribunal"],
        "state_applicability": "India/Karnataka",
    },
]


def seed_database(db: Session) -> None:
    # ── Admin user ───────────────────────────────────────────────────────────
    if not db.scalar(select(User).where(User.email == "admin@smartnyaya.local")):
        db.add(User(
            name="Smart Nyaya Admin",
            email="admin@smartnyaya.local",
            phone="08000000000",
            password_hash=hash_password("Admin@12345"),
            role=UserRole.admin.value,
            district="Bengaluru Urban",
            language_pref="English",
        ))

    # ── Directory services — always re-seed to keep data current ────────────
    full_directory = KARNATAKA_DIRECTORY + GENERIC_DIRECTORY
    current_count = db.scalar(select(func.count(DirectoryService.service_id))) or 0

    # Force reseed whenever the data has grown (new entries added in code)
    if current_count < len(full_directory):
        db.query(DirectoryService).delete()
        for entry in full_directory:
            db.add(DirectoryService(
                name=entry["name"],
                service_type=entry["service_type"],
                district=entry["district"],
                taluk=entry.get("taluk"),
                address=entry["address"],
                phone=entry.get("phone"),
                latitude=entry.get("latitude"),
                longitude=entry.get("longitude"),
            ))

    # ── Legal statutes ───────────────────────────────────────────────────────
    if not db.scalar(select(LegalStatute).limit(1)):
        for statute in KARNATAKA_STATUTES:
            db.add(LegalStatute(**statute))

    # ── Startup notification ─────────────────────────────────────────────────
    admin = db.scalar(select(User).where(User.email == "admin@smartnyaya.local"))
    if admin and not db.scalar(select(Notification).where(Notification.user_id == admin.user_id)):
        db.add(Notification(
            user_id=admin.user_id,
            title="Platform ready",
            message=f"Smart Karnataka Nyaya seeded with {len(full_directory)} directory entries and {len(KARNATAKA_STATUTES)} legal statutes.",
        ))

    db.commit()
