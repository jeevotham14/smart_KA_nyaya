import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Make sure we clean up duplicate profiles before tests.
c = c.replace(
    'adv1 = AdvocateProfile(',
    'db_session.query(AdvocateProfile).filter_by(user_id=test_user.user_id).delete(); db_session.commit(); adv1 = AdvocateProfile('
)
c = c.replace(
    'prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id',
    'db_session.query(AdvocateProfile).filter_by(user_id=test_user.user_id).delete(); db_session.commit(); prof = AdvocateProfile(id=uuid.uuid4(), user_id=test_user.user_id'
)

# Fix the test user logic back to original
# Wait, I previously changed the whole block in my fix_adv_filter.py!
# I'll just undo it and use the `test_user` but with verify status VERIFIED and delete query.
