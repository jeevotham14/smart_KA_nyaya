import re
import os

filepath = 'frontend/src/pages/broadcasts/BroadcastFeature.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add useTranslation import if not there
if "useTranslation" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';")

# Add isKn to components
components = ["export const RequestAdvocateMatches = ({ onSuccess }) => {", "export const MyBroadcastRequests = ({ refreshTrigger }) => {", "export const AdvocateBroadcastInbox = () => {"]
for comp in components:
    if "const isKn" not in content.split(comp)[1][:200]:
        content = content.replace(comp, comp + "\n  const { i18n } = useTranslation();\n  const isKn = i18n.language === 'kn';\n")

# Replacements (text inside tags)
replacements = {
    ">Request Advocate Matches<": ">{isKn ? 'ವಕೀಲರ ಹೊಂದಾಣಿಕೆಗೆ ವಿನಂತಿಸಿ' : 'Request Advocate Matches'}<",
    ">Describe your issue and matching advocates in your district will be notified.<": ">{isKn ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ವಕೀಲರಿಗೆ ಸೂಚಿಸಲಾಗುತ್ತದೆ.' : 'Describe your issue and matching advocates in your district will be notified.'}<",
    ">Privacy Notice: Do not include Aadhaar numbers, bank details, passwords, exact account numbers, or unnecessary sensitive information. Supporting legal documents can be shared privately after the consultation is confirmed.<": ">{isKn ? 'ಗೌಪ್ಯತೆ ಸೂಚನೆ: ಆಧಾರ್, ಬ್ಯಾಂಕ್ ವಿವರಗಳು, ಅಥವಾ ಸೂಕ್ಷ್ಮ ಮಾಹಿತಿಯನ್ನು ಸೇರಿಸಬೇಡಿ. ಸಮಾಲೋಚನೆಯ ನಂತರ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬಹುದು.' : 'Privacy Notice: Do not include Aadhaar numbers, bank details, passwords, exact account numbers, or unnecessary sensitive information. Supporting legal documents can be shared privately after the consultation is confirmed.'}<",
    ">Legal Category *<": ">{isKn ? 'ಕಾನೂನು ವರ್ಗ *' : 'Legal Category *'}<",
    ">District *<": ">{isKn ? 'ಜಿಲ್ಲೆ *' : 'District *'}<",
    ">Preferred Language<": ">{isKn ? 'ಆದ್ಯತೆಯ ಭಾಷೆ' : 'Preferred Language'}<",
    ">Consultation Mode<": ">{isKn ? 'ಸಮಾಲೋಚನೆ ವಿಧಾನ' : 'Consultation Mode'}<",
    ">Preferred Date<": ">{isKn ? 'ಆದ್ಯತೆಯ ದಿನಾಂಕ' : 'Preferred Date'}<",
    ">Preferred Time<": ">{isKn ? 'ಆದ್ಯತೆಯ ಸಮಯ' : 'Preferred Time'}<",
    ">Short Case Summary *<": ">{isKn ? 'ಪ್ರಕರಣದ ಸಾರಾಂಶ *' : 'Short Case Summary *'}<",
    ">I am requesting pro-bono (free) legal assistance<": ">{isKn ? 'ನಾನು ಪ್ರೊ-ಬೊನೊ (ಉಚಿತ) ಕಾನೂನು ಸಹಾಯವನ್ನು ಕೋರುತ್ತಿದ್ದೇನೆ' : 'I am requesting pro-bono (free) legal assistance'}<",
    ">Send Broadcast Request<": ">{isKn ? 'ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ' : 'Send Broadcast Request'}<",
    ">My Broadcasts<": ">{isKn ? 'ನನ್ನ ವಿನಂತಿಗಳು' : 'My Broadcasts'}<",
    ">No broadcast requests yet.<": ">{isKn ? 'ಯಾವುದೇ ವಿನಂತಿಗಳಿಲ್ಲ.' : 'No broadcast requests yet.'}<",
    ">Request Sent!<": ">{isKn ? 'ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ!' : 'Request Sent!'}<",
    ">Matching advocates have been notified. You will receive a notification when an advocate responds.<": ">{isKn ? 'ಹೊಂದಾಣಿಕೆಯ ವಕೀಲರಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ. ವಕೀಲರು ಪ್ರತಿಕ್ರಿಯಿಸಿದಾಗ ನಿಮಗೆ ಅಧಿಸೂಚನೆ ಬರುತ್ತದೆ.' : 'Matching advocates have been notified. You will receive a notification when an advocate responds.'}<",
    ">View Interested Advocates<": ">{isKn ? 'ಆಸಕ್ತ ವಕೀಲರನ್ನು ವೀಕ್ಷಿಸಿ' : 'View Interested Advocates'}<",
    ">Hide Responses<": ">{isKn ? 'ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಮರೆಮಾಡಿ' : 'Hide Responses'}<",
    ">Cancel<": ">{isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}<",
    ">No advocates have responded yet.<": ">{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ವಕೀಲರು ಪ್ರತಿಕ್ರಿಯಿಸಿಲ್ಲ.' : 'No advocates have responded yet.'}<",
    ">Select<": ">{isKn ? 'ಆಯ್ಕೆಮಾಡಿ' : 'Select'}<",
    ">Broadcast Requests<": ">{isKn ? 'ವಿನಂತಿಗಳು' : 'Broadcast Requests'}<",
    ">No matching broadcast requests at this time.<": ">{isKn ? 'ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ವಿನಂತಿಗಳಿಲ್ಲ.' : 'No matching broadcast requests at this time.'}<",
    ">Pro-Bono Requested<": ">{isKn ? 'ಉಚಿತ ಸಹಾಯ ಕೋರಲಾಗಿದೆ' : 'Pro-Bono Requested'}<",
    ">I'm Interested<": ">{isKn ? 'ನನಗೆ ಆಸಕ್ತಿ ಇದೆ' : \"I'm Interested\"}<",
    ">Decline<": ">{isKn ? 'ತಿರಸ್ಕರಿಸಿ' : 'Decline'}<"
}

for eng, kannada in replacements.items():
    content = content.replace(eng, kannada)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BroadcastFeature.jsx")
