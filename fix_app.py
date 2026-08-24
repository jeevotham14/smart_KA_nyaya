with open("frontend/src/App.jsx", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    "const Consultations = lazy(() => import('./pages/Consultations.jsx'));",
    "const Consultations = lazy(() => import('./pages/Consultations.jsx'));\nconst ConsultationBroadcasts = lazy(() => import('./pages/ConsultationBroadcasts.jsx'));"
)

c = c.replace(
    "<Route path=\"consultations\" element={<Consultations />} />",
    "<Route path=\"consultations\" element={<Consultations />} />\n          <Route path=\"consultation-broadcasts\" element={<ConsultationBroadcasts />} />"
)

with open("frontend/src/App.jsx", "w", encoding="utf-8") as f:
    f.write(c)
