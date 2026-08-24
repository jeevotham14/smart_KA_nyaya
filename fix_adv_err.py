with open('frontend/src/pages/Advocates.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('setError(getApiError(err));', 'setError("Unable to connect to the advocate service.");')
with open('frontend/src/pages/Advocates.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
