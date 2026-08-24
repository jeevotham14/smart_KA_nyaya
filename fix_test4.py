with open('frontend/src/pages/Advocates.test.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("expect(screen.getByRole('status') || document.querySelector('.animate-spin')).toBeInTheDocument();", "expect(document.querySelector('.animate-spin')).toBeInTheDocument();")

with open('frontend/src/pages/Advocates.test.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
