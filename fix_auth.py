with open('backend/app/api/routes/auth.py', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('taluk=payload.taluk,', 'taluk=payload.taluk,\n        role="advocate" if payload.role == "advocate" else "citizen",')
with open('backend/app/api/routes/auth.py', 'w', encoding='utf-8') as f:
    f.write(c)
