import re

with open('backend/app/api/routes/advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_block = '''    if current_user.role != "advocate":
        # allow role change if they create profile? Or enforce it?
        pass # Let's assume they want to become an advocate'''

new_block = '''    if current_user.role != "advocate":
        raise HTTPException(status_code=403, detail="Only advocates can create an advocate profile")'''

c = c.replace(old_block, new_block)

old_block2 = '''    if current_user.role != "advocate":
        current_user.role = "advocate"
        db.commit()'''

c = c.replace(old_block2, '')

with open('backend/app/api/routes/advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
