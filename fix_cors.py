with open('backend/app/core/config.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]', 'cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "https://smart-ka-nyaya.onrender.com"]')

with open('backend/app/core/config.py', 'w', encoding='utf-8') as f:
    f.write(c)
