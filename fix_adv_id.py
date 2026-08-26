import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('user_id=uuid.uuid4().hex', 'user_id=uuid.uuid4()')

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
