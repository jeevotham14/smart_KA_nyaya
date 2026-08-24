import re
with open('backend/app/api/routes/advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('@router.get("/", response_model=List[AdvocateProfileRead])', '@router.get("", response_model=List[AdvocateProfileRead])')

with open('backend/app/api/routes/advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
