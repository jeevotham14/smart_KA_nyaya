with open('backend/tests/test_advocate_onboarding.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('adv1_db = db.query(AdvocateProfile).filter(AdvocateProfile.id == prof["id"]).first()', 'adv1_db = db.query(AdvocateProfile).filter(AdvocateProfile.id == uuid.UUID(prof["id"])).first()')

with open('backend/tests/test_advocate_onboarding.py', 'w', encoding='utf-8') as f:
    f.write(c)
