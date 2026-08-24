with open('frontend/src/pages/Advocates.test.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("expect(screen.getByText(/Civil Law/i)).toBeInTheDocument();", "expect(screen.getAllByText(/Civil Law/i).length).toBeGreaterThan(0);")

with open('frontend/src/pages/Advocates.test.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
