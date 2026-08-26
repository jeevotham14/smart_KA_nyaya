import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '''adv1 = AdvocateProfile(
        id=uuid.uuid4(),
        user_id=test_user.user_id,
        full_name="Alice",
        bar_council_number="KAR/456",
        district="Mysuru",
        specializations=["Criminal Law"],
        is_active=True,
        consultation_fee=100.0
    )''',
    '''adv1 = AdvocateProfile(
        id=uuid.uuid4(),
        user_id=test_user.user_id,
        full_name="Alice",
        bar_council_number="KAR/456",
        district="Mysuru",
        specializations=["Criminal Law"],
        is_active=True,
        verification_status="VERIFIED",
        consultation_fee=100.0
    )'''
)

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)

with open('backend/tests/test_api.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    '''def test_directory_search():
    response = client.get("/api/directory/search?district=Bengaluru Urban")
    assert response.status_code == 200
    assert len(response.json()) >= 1''',
    '''def test_directory_search():
    # Insert a dummy record first to pass the assertion since test_advocate_onboarding.py wiped the DB.
    from app.db.session import SessionLocal
    from app.models.domain import DirectoryService
    db = SessionLocal()
    if not db.query(DirectoryService).first():
        db.add(DirectoryService(
            name="Test Service",
            service_type="court",
            district="Bengaluru Urban",
            address="Test Address"
        ))
        db.commit()
    db.close()
    
    response = client.get("/api/directory/search?district=Bengaluru Urban")
    assert response.status_code == 200
    assert len(response.json()) >= 1'''
)

with open('backend/tests/test_api.py', 'w', encoding='utf-8') as f:
    f.write(c)
