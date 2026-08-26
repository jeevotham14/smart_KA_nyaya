import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

old = '''prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", 
district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, 
offline_consultation=False, pro_bono_available=False, years_of_experience=5)'''

new = '''db_session.query(AdvocateProfile).filter_by(user_id=test_user.user_id).delete()
    db_session.commit()
    prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id, full_name="X", bar_council_number="X/1", 
district="X", consultation_fee=0, is_active=True, verification_status="VERIFIED", online_consultation=True, 
offline_consultation=False, pro_bono_available=False, years_of_experience=5)'''

c = c.replace(old, new)

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
