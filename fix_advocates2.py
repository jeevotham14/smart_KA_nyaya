import re
with open('backend/app/api/routes/advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. GET /
c = c.replace('query = db.query(AdvocateProfile).filter(AdvocateProfile.is_active == True)', 'query = db.query(AdvocateProfile).filter(AdvocateProfile.is_active == True, AdvocateProfile.verification_status == "VERIFIED")')

# 2. POST /profile
old_post = '''    existing = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    advocate = AdvocateProfile(
        user_id=current_user.user_id,
        **profile_in.dict()
    )'''

new_post = '''    existing = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    if db.query(AdvocateProfile).filter(AdvocateProfile.bar_council_number == profile_in.bar_council_number).first():
        raise HTTPException(status_code=400, detail="Bar council number already registered")
    
    profile_data = profile_in.dict()
    profile_data['verification_status'] = 'PENDING'
    profile_data['is_active'] = False
    
    advocate = AdvocateProfile(
        user_id=current_user.user_id,
        **profile_data
    )'''
c = c.replace(old_post, new_post)

# 3. PUT /profile
old_put = '''    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():'''

new_put = '''    update_data = profile_in.dict(exclude_unset=True)
    update_data.pop('verification_status', None)
    update_data.pop('is_active', None)
    for field, value in update_data.items():'''
c = c.replace(old_put, new_put)

with open('backend/app/api/routes/advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
