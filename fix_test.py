with open('frontend/src/pages/Advocates.test.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("user_id: '1',\n        user: { full_name: 'Test Advocate' },", "user_id: '1',\n        full_name: 'Test Advocate',")
c = c.replace("adv.user?.full_name", "adv.full_name")

with open('frontend/src/pages/Advocates.test.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
