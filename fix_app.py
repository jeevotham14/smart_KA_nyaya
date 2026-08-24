import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("import LoginRegister from './pages/LoginRegister.jsx';", "import LoginRegister from './pages/LoginRegister.jsx';\nconst AdvocateOnboarding = lazy(() => import('./pages/AdvocateOnboarding.jsx'));")
c = c.replace('<Route path="login" element={<LoginRegister />} />', '<Route path="login" element={<LoginRegister />} />\n          <Route path="advocate/onboarding" element={<AdvocateOnboarding />} />')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
