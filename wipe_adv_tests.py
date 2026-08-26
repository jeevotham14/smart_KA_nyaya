import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

# For test_get_advocates_filtering
old = '''def test_get_advocates_filtering(client: TestClient, db_session: Session, test_user):
    from app.models.domain import User
    import uuid
    new_user = User(
        user_id=uuid.uuid4(),
        name="Test",
        email=f"test{uuid.uuid4().hex}@test.com",
        password_hash="hash",
        role="advocate"
    )
    db_session.add(new_user)
    db_session.commit()
    
    adv1 = AdvocateProfile(
        id=uuid.uuid4(),
        user_id=new_user.user_id,
        full_name="Alice",
        bar_council_number=f"KAR/456{uuid.uuid4().hex}",
        district="Mysuru",
        specializations=["Criminal Law"],
        is_active=True,
        verification_status="VERIFIED",
        consultation_fee=100.0
    )
    db_session.add(adv1)
    db_session.commit()'''

new = '''def test_get_advocates_filtering(client: TestClient, db_session: Session, test_user):
    import uuid
    db_session.query(AdvocateProfile).filter_by(user_id=test_user.user_id).delete()
    db_session.commit()
    adv1 = AdvocateProfile(
        id=uuid.uuid4(),
        user_id=test_user.user_id,
        full_name="Alice",
        bar_council_number=f"KAR/456{uuid.uuid4().hex}",
        district="Mysuru",
        specializations=["Criminal Law"],
        is_active=True,
        verification_status="VERIFIED",
        consultation_fee=100.0
    )
    db_session.add(adv1)
    db_session.commit()'''

if old in c:
    c = c.replace(old, new)
else:
    print("Not found")

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
