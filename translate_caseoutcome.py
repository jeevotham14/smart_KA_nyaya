import re
import os

filepath = 'frontend/src/pages/CaseOutcome.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "useTranslation" not in content:
    content = content.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { useTranslation } from 'react-i18next';")

if "const isKn" not in content:
    content = content.replace("const [caseText, setCaseText] = useState('');", "const { i18n } = useTranslation();\n  const isKn = i18n.language === 'kn';\n  const [caseText, setCaseText] = useState('');")

replacements = {
    ">Case Outcome Predictor<": ">{isKn ? 'ಪ್ರಕರಣದ ಫಲಿತಾಂಶ ಮುನ್ಸೂಚಕ' : 'Case Outcome Predictor'}<",
    ">Enter the facts of your case to get an AI-powered prediction based on historical court data.<": ">{isKn ? 'ಐತಿಹಾಸಿಕ ನ್ಯಾಯಾಲಯದ ಡೇಟಾ ಆಧಾರಿತ ಮುನ್ಸೂಚನೆಯನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.' : 'Enter the facts of your case to get an AI-powered prediction based on historical court data.'}<",
    ">Case Description<": ">{isKn ? 'ಪ್ರಕರಣದ ವಿವರಣೆ' : 'Case Description'}<",
    ">For better results, provide a detailed case description with relevant facts, timeline, parties, evidence, and procedural history.<": ">{isKn ? 'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ, ಸಂಬಂಧಿತ ಸಂಗತಿಗಳು, ಕಾಲಮಿತಿ, ಪಕ್ಷಗಳು, ಸಾಕ್ಷ್ಯ ಮತ್ತು ಕಾರ್ಯವಿಧಾನದ ಇತಿಹಾಸದೊಂದಿಗೆ ವಿವರವಾದ ಪ್ರಕರಣದ ವಿವರಣೆಯನ್ನು ಒದಗಿಸಿ.' : 'For better results, provide a detailed case description with relevant facts, timeline, parties, evidence, and procedural history.'}<",
    ">Recommended: 250+ words<": ">{isKn ? 'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ: 250+ ಪದಗಳು' : 'Recommended: 250+ words'}<",
    "placeholder=\"Describe the facts of your case, what happened, relevant dates, parties involved, evidence available, previous court orders if any, and the current legal issue...\"": "placeholder={isKn ? 'ನಿಮ್ಮ ಪ್ರಕರಣದ ಸಂಗತಿಗಳು, ಏನಾಯಿತು, ಸಂಬಂಧಿತ ದಿನಾಂಕಗಳು, ಒಳಗೊಂಡಿರುವ ಪಕ್ಷಗಳು, ಲಭ್ಯವಿರುವ ಸಾಕ್ಷ್ಯ, ಹಿಂದಿನ ನ್ಯಾಯಾಲಯದ ಆದೇಶಗಳು ಮತ್ತು ಪ್ರಸ್ತುತ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ...' : 'Describe the facts of your case, what happened, relevant dates, parties involved, evidence available, previous court orders if any, and the current legal issue...'}",
    ">Input quality helper text<": ">{isKn ? 'ಇನ್ಪುಟ್ ಗುಣಮಟ್ಟ ಸಹಾಯಕ ಪಠ್ಯ' : 'Input quality helper text'}<",
    "{wordCount} words": "{wordCount} {isKn ? 'ಪದಗಳು' : 'words'}",
    "Analyzing case description...": "{isKn ? 'ಪ್ರಕರಣದ ವಿವರಣೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing case description...'}",
    ">Analyze Case<": ">{isKn ? 'ಪ್ರಕರಣವನ್ನು ವಿಶ್ಲೇಷಿಸಿ' : 'Analyze Case'}<",
    ">Analysis Results<": ">{isKn ? 'ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶಗಳು' : 'Analysis Results'}<",
    ">Historical Pattern<": ">{isKn ? 'ಐತಿಹಾಸಿಕ ಮಾದರಿ' : 'Historical Pattern'}<",
    "Rejected Outcome": "{isKn ? 'ತಿರಸ್ಕರಿಸಲಾದ ಫಲಿತಾಂಶ' : 'Rejected Outcome'}",
    "Accepted Outcome": "{isKn ? 'ಸ್ವೀಕರಿಸಲಾದ ಫಲಿತಾಂಶ' : 'Accepted Outcome'}",
    "Model Probability (Accepted)": "{isKn ? 'ಮಾದರಿ ಸಂಭವನೀಯತೆ (ಸ್ವೀಕರಿಸಲಾಗಿದೆ)' : 'Model Probability (Accepted)'}",
    "Rejected pattern:": "{isKn ? 'ತಿರಸ್ಕರಿಸಲಾದ ಮಾದರಿ:' : 'Rejected pattern:'}",
    ">Confidence State<": ">{isKn ? 'ವಿಶ್ವಾಸಾರ್ಹತೆ ಸ್ಥಿತಿ' : 'Confidence State'}<",
    ">Human Review Recommended<": ">{isKn ? 'ಮಾನವ ವಿಮರ್ಶೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ' : 'Human Review Recommended'}<",
    ">The model is not sufficiently confident in this case description. Consider reviewing the matter with a qualified legal professional.<": ">{isKn ? 'ಈ ಪ್ರಕರಣದ ವಿವರಣೆಯಲ್ಲಿ ಮಾದರಿಯು ಸಾಕಷ್ಟು ವಿಶ್ವಾಸ ಹೊಂದಿಲ್ಲ. ಅರ್ಹ ಕಾನೂನು ವೃತ್ತಿಪರರೊಂದಿಗೆ ವಿಷಯವನ್ನು ಪರಿಶೀಲಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.' : 'The model is not sufficiently confident in this case description. Consider reviewing the matter with a qualified legal professional.'}<",
    ">Input Diagnostics<": ">{isKn ? 'ಇನ್ಪುಟ್ ರೋಗನಿರ್ಣಯ' : 'Input Diagnostics'}<",
    ">Input Quality<": ">{isKn ? 'ಇನ್ಪುಟ್ ಗುಣಮಟ್ಟ' : 'Input Quality'}<",
    ">Token/Word Count<": ">{isKn ? 'ಟೋಕನ್/ಪದಗಳ ಎಣಿಕೆ' : 'Token/Word Count'}<",
    ">Vocabulary Coverage<": ">{isKn ? 'ಶಬ್ದಕೋಶದ ವ್ಯಾಪ್ತಿ' : 'Vocabulary Coverage'}<",
    ">The language in this description differs substantially from the model's training data, so the estimate may be less reliable.<": ">{isKn ? 'ಈ ವಿವರಣೆಯಲ್ಲಿನ ಭಾಷೆಯು ಮಾದರಿಯ ತರಬೇತಿ ಡೇಟಾಕ್ಕಿಂತ ಗಣನೀಯವಾಗಿ ಭಿನ್ನವಾಗಿದೆ, ಆದ್ದರಿಂದ ಅಂದಾಜು ಕಡಿಮೆ ವಿಶ್ವಾಸಾರ್ಹವಾಗಿರಬಹುದು.' : 'The language in this description differs substantially from the model\\'s training data, so the estimate may be less reliable.'}<",
    ">Disclaimer<": ">{isKn ? 'ಹಕ್ಕುತ್ಯಾಗ' : 'Disclaimer'}<",
    ">This system is an experimental decision-support tool trained on historical Indian Supreme Court appeal data. It does not predict guaranteed court outcomes and does not provide legal advice.<": ">{isKn ? 'ಈ ವ್ಯವಸ್ಥೆಯು ಐತಿಹಾಸಿಕ ಭಾರತೀಯ ಸುಪ್ರೀಂ ಕೋರ್ಟ್ ಮೇಲ್ಮನವಿ ಡೇಟಾದ ಮೇಲೆ ತರಬೇತಿ ಪಡೆದ ಪ್ರಾಯೋಗಿಕ ನಿರ್ಧಾರ-ಬೆಂಬಲ ಸಾಧನವಾಗಿದೆ. ಇದು ಖಾತರಿಯ ನ್ಯಾಯಾಲಯದ ಫಲಿತಾಂಶಗಳನ್ನು ಊಹಿಸುವುದಿಲ್ಲ ಮತ್ತು ಕಾನೂನು ಸಲಹೆಯನ್ನು ನೀಡುವುದಿಲ್ಲ.' : 'This system is an experimental decision-support tool trained on historical Indian Supreme Court appeal data. It does not predict guaranteed court outcomes and does not provide legal advice.'}<"
}

for eng, kannada in replacements.items():
    content = content.replace(eng, kannada)

content = content.replace("return 'HIGH_CONFIDENCE';", "return isKn ? 'ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸ' : 'HIGH_CONFIDENCE';")
content = content.replace("return 'MODERATE_CONFIDENCE';", "return isKn ? 'ಮಧ್ಯಮ ವಿಶ್ವಾಸ' : 'MODERATE_CONFIDENCE';")
content = content.replace("return 'LOW_CONFIDENCE (Review Recommended)';", "return isKn ? 'ಕಡಿಮೆ ವಿಶ್ವಾಸ (ವಿಮರ್ಶೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)' : 'LOW_CONFIDENCE (Review Recommended)';")

content = content.replace("return 'EXCELLENT';", "return isKn ? 'ಅತ್ಯುತ್ತಮ' : 'EXCELLENT';")
content = content.replace("return 'GOOD';", "return isKn ? 'ಉತ್ತಮ' : 'GOOD';")
content = content.replace("return 'MARGINAL (Too Short)';", "return isKn ? 'ಕನಿಷ್ಠ (ತುಂಬಾ ಚಿಕ್ಕದು)' : 'MARGINAL (Too Short)';")
content = content.replace("return 'POOR (Needs more detail)';", "return isKn ? 'ಕಳಪೆ (ಹೆಚ್ಚಿನ ವಿವರಗಳ ಅಗತ್ಯವಿದೆ)' : 'POOR (Needs more detail)';")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CaseOutcome.jsx")
