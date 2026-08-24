with open('frontend/src/pages/AdvocateOnboarding.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("import { karnatakaDistricts } from '../data/districts';", "import { karnatakaDistricts } from '../data/mockData.js';")
with open('frontend/src/pages/AdvocateOnboarding.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
