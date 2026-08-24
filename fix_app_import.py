import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("const LoginRegister = lazy(() => import('./pages/LoginRegister.jsx'));", "const LoginRegister = lazy(() => import('./pages/LoginRegister.jsx'));\nconst AdvocateOnboarding = lazy(() => import('./pages/AdvocateOnboarding.jsx'));")

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
