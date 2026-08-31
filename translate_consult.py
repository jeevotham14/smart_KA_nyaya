import re
import os

filepath = 'frontend/src/pages/ConsultAdvocate.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The TABS constant is in the file.
content = content.replace("label: 'Browse Advocates'", "label: isKn ? 'ವಕೀಲರನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Advocates'")
content = content.replace("label: 'Request Advocate Match'", "label: isKn ? 'ವಕೀಲರ ಹೊಂದಾಣಿಕೆಗೆ ವಿನಂತಿಸಿ' : 'Request Advocate Match'")
content = content.replace("label: 'My Consultations'", "label: isKn ? 'ನನ್ನ ಸಮಾಲೋಚನೆಗಳು' : 'My Consultations'")

# Now for JSX
content = content.replace(">Search & Filter Advocates<", ">{isKn ? 'ವಕೀಲರನ್ನು ಹುಡುಕಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಮಾಡಿ' : 'Search & Filter Advocates'}<")
content = content.replace(">Select District<", ">{isKn ? 'ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select District'}<")
content = content.replace("placeholder=\"Search by name or specialization...\"", "placeholder={isKn ? 'ಹೆಸರು ಅಥವಾ ಪರಿಣತಿಯ ಮೂಲಕ ಹುಡುಕಿ...' : 'Search by name or specialization...'}")
content = content.replace(">Search<", ">{isKn ? 'ಹುಡುಕಿ' : 'Search'}<")
content = content.replace(">No advocates found.<", ">{isKn ? 'ಯಾವುದೇ ವಕೀಲರು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No advocates found.'}<")
content = content.replace(">Verified Advocate<", ">{isKn ? 'ಪರಿಶೀಲಿಸಿದ ವಕೀಲರು' : 'Verified Advocate'}<")
content = content.replace(">Pending Verification<", ">{isKn ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ' : 'Pending Verification'}<")
content = content.replace(">Pro-Bono<", ">{isKn ? 'ಉಚಿತ ಸೇವೆ' : 'Pro-Bono'}<")
content = content.replace("Years Exp.", "{isKn ? 'ವರ್ಷಗಳ ಅನುಭವ' : 'Years Exp.'}")
content = content.replace("Fee: ", "{isKn ? 'ಶುಲ್ಕ: ' : 'Fee: '}")
content = content.replace("per session", "{isKn ? 'ಪ್ರತಿ ಸೆಷನ್‌ಗೆ' : 'per session'}")
content = content.replace(">Request Consultation<", ">{isKn ? 'ಸಮಾಲೋಚನೆಗೆ ವಿನಂತಿಸಿ' : 'Request Consultation'}<")
content = content.replace(">Broadcast Consultation Request<", ">{isKn ? 'ಸಮಾಲೋಚನೆ ವಿನಂತಿಯನ್ನು ಪ್ರಸಾರ ಮಾಡಿ' : 'Broadcast Consultation Request'}<")
content = content.replace(">Describe your legal issue, and matching advocates in your district will be notified. You can then choose from the advocates who express interest.<", ">{isKn ? 'ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ, ಮತ್ತು ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯಾಗುವ ವಕೀಲರಿಗೆ ಸೂಚಿಸಲಾಗುತ್ತದೆ. ಆಸಕ್ತಿ ವ್ಯಕ್ತಪಡಿಸುವ ವಕೀಲರಿಂದ ನೀವು ಆಯ್ಕೆ ಮಾಡಬಹುದು.' : 'Describe your legal issue, and matching advocates in your district will be notified. You can then choose from the advocates who express interest.'}<")

content = content.replace(">Legal Category<", ">{isKn ? 'ಕಾನೂನು ವರ್ಗ' : 'Legal Category'}<")
content = content.replace(">District<", ">{isKn ? 'ಜಿಲ್ಲೆ' : 'District'}<")
content = content.replace(">Language<", ">{isKn ? 'ಭಾಷೆ' : 'Language'}<")
content = content.replace(">Consultation Mode<", ">{isKn ? 'ಸಮಾಲೋಚನೆ ವಿಧಾನ' : 'Consultation Mode'}<")
content = content.replace("Online (Video/Audio)", "{isKn ? 'ಆನ್‌ಲೈನ್ (ವೀಡಿಯೊ/ಆಡಿಯೊ)' : 'Online (Video/Audio)'}")
content = content.replace("In-Person (Office)", "{isKn ? 'ಖುದ್ದಾಗಿ (ಕಚೇರಿ)' : 'In-Person (Office)'}")
content = content.replace(">Brief Case Summary<", ">{isKn ? 'ಸಂಕ್ಷಿಪ್ತ ಪ್ರಕರಣದ ಸಾರಾಂಶ' : 'Brief Case Summary'}<")
content = content.replace("placeholder=\"What is your legal issue about? Do not include sensitive info like account numbers.\"", "placeholder={isKn ? 'ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆ ಏನು? ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿಯನ್ನು ಸೇರಿಸಬೇಡಿ.' : 'What is your legal issue about? Do not include sensitive info like account numbers.'}")
content = content.replace(">I am requesting pro-bono (free) legal assistance.<", ">{isKn ? 'ನಾನು ಉಚಿತ (ಪ್ರೊ-ಬೊನೊ) ಕಾನೂನು ಸಹಾಯವನ್ನು ಕೋರುತ್ತಿದ್ದೇನೆ.' : 'I am requesting pro-bono (free) legal assistance.'}<")
content = content.replace(">Sending...<", ">{isKn ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Sending...'}<")
content = content.replace(">Broadcast Request<", ">{isKn ? 'ವಿನಂತಿಯನ್ನು ಪ್ರಸಾರ ಮಾಡಿ' : 'Broadcast Request'}<")
content = content.replace(">No consultations found.<", ">{isKn ? 'ಯಾವುದೇ ಸಮಾಲೋಚನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.' : 'No consultations found.'}<")
content = content.replace("Date:", "{isKn ? 'ದಿನಾಂಕ:' : 'Date:'}")
content = content.replace("Time:", "{isKn ? 'ಸಮಯ:' : 'Time:'}")
content = content.replace("Advocate:", "{isKn ? 'ವಕೀಲರು:' : 'Advocate:'}")
content = content.replace("Status:", "{isKn ? 'ಸ್ಥಿತಿ:' : 'Status:'}")
content = content.replace(">Join Call<", ">{isKn ? 'ಕರೆ ಸೇರಿ' : 'Join Call'}<")
content = content.replace(">Cancel<", ">{isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}<")
content = content.replace(">Direct Consultation Request<", ">{isKn ? 'ನೇರ ಸಮಾಲೋಚನೆ ವಿನಂತಿ' : 'Direct Consultation Request'}<")
content = content.replace(">Advocate selected:<", ">{isKn ? 'ಆಯ್ಕೆಮಾಡಿದ ವಕೀಲರು:' : 'Advocate selected:'}<")
content = content.replace(">Send Direct Request<", ">{isKn ? 'ನೇರ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ' : 'Send Direct Request'}<")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated ConsultAdvocate.jsx")
