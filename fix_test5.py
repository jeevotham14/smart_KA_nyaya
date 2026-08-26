with open('backend/tests/test_advocate_onboarding.py', 'r', encoding='utf-8') as f:
    c = f.read()

old_test = '''    # 5. citizen cannot create advocate profile
    cit = create_user("citizen")
    cit_token = login_user(cit["email"])
    cit_prof = create_profile(cit_token)
    # Actually wait! The route says if current_user.role != "advocate": current_user.role = "advocate"!
    # Let me check if the route blocks citizens or just converts them.
    # The requirement says "citizen cannot create advocate profile". 
    # But wait, maybe the route just converts them? 
    # Let me double check what the route actually does.
    pass'''

new_test = '''    # 5. citizen cannot create advocate profile
    cit = create_user("citizen")
    cit_token = login_user(cit["email"])
    cit_prof = create_profile(cit_token)
    assert cit_prof.status_code == 403'''

c = c.replace(old_test, new_test)

with open('backend/tests/test_advocate_onboarding.py', 'w', encoding='utf-8') as f:
    f.write(c)
