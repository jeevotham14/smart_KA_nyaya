import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'res = client.get("/api/advocates/?district=Mysuru")',
    'res = client.get("/api/advocates?district=Mysuru")'
)

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
