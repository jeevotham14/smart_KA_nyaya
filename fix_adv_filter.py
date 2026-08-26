import re

with open('backend/tests/test_advocates.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_block = '''def test_get_advocates_filtering(client: TestClient, db_session: Session, test_user):
    adv1 = AdvocateProfile(
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

new_block = '''def test_get_advocates_filtering(client: TestClient, db_session: Session, test_user):
    from app.models.domain import User
    import uuid
    new_user = User(
        user_id=uuid.uuid4().hex,
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
    )'''

c = c.replace(old_block, new_block)

with open('backend/tests/test_advocates.py', 'w', encoding='utf-8') as f:
    f.write(c)
