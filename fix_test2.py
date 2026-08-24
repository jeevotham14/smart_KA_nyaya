with open('frontend/src/pages/Advocates.test.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("expect(screen.getByText('Civil Law')).toBeInTheDocument();", "expect(screen.getByText(/Civil Law/i)).toBeInTheDocument();")

with open('frontend/src/pages/Advocates.test.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
