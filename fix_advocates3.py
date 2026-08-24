with open('backend/app/api/routes/advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

new_me = '''
@router.get("/me/profile", response_model=AdvocateProfileRead)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    advocate = db.query(AdvocateProfile).filter(AdvocateProfile.user_id == current_user.user_id).first()
    if not advocate:
        raise HTTPException(status_code=404, detail="Profile not found")
    return advocate

@router.get("/{advocate_id}", response_model=AdvocateProfileRead)
'''
c = c.replace('@router.get("/{advocate_id}", response_model=AdvocateProfileRead)', new_me)

with open('backend/app/api/routes/advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
