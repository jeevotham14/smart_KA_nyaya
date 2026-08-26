import re
import os

with open('frontend/src/data/mockData.js', 'r', encoding='utf-8') as f:
    c = f.read()

districts_match = re.search(r'(export const karnatakaDistricts = \{.*?\n\};)', c, re.DOTALL)
if districts_match:
    karnatakaDistrictsStr = districts_match.group(1)
    # Remove from mockData
    c = c.replace(karnatakaDistrictsStr, '')
    with open('frontend/src/data/mockData.js', 'w', encoding='utf-8') as f:
        f.write(c)
        
    with open('frontend/src/data/karnatakaDistricts.js', 'w', encoding='utf-8') as f:
        f.write(karnatakaDistrictsStr)

def replace_import(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'karnatakaDistricts' in content:
        content = content.replace("from '../data/mockData.js'", "from '../data/karnatakaDistricts.js'")
        content = content.replace("from '../data/mockData'", "from '../data/karnatakaDistricts.js'")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, _, files in os.walk('frontend/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            replace_import(os.path.join(root, file))
