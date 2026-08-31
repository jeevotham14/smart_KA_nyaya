import re
import os

filepath = 'frontend/src/components/Header.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the navItems array
content = content.replace("['nav.aiGuidance', '/ai-legal-guidance'],", "[isKn ? 'AI ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ' : 'AI Legal Guidance', '/ai-legal-guidance'],")
content = content.replace("['Case Outcome', '/case-outcome'],", "[isKn ? 'ಪ್ರಕರಣದ ಫಲಿತಾಂಶ' : 'Case Outcome', '/case-outcome'],")
content = content.replace("['Consult an Advocate', '/advocates'],", "[isKn ? 'ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ' : 'Consult an Advocate', '/advocates'],")

content = content.replace("['My Consultations', '/consultations'],", "[isKn ? 'ನನ್ನ ಸಮಾಲೋಚನೆಗಳು' : 'My Consultations', '/consultations'],")
content = content.replace("['My Broadcast Requests', '/consultation-broadcasts'],", "[isKn ? 'ನನ್ನ ವಿನಂತಿಗಳು' : 'My Broadcast Requests', '/consultation-broadcasts'],")
content = content.replace("['Dashboard', '/dashboard']", "[isKn ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Dashboard', '/dashboard']")

content = content.replace("['Emergency', '/emergency'],", "[isKn ? 'ತುರ್ತು ಸಹಾಯ' : 'Emergency', '/emergency'],")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Header.jsx")
