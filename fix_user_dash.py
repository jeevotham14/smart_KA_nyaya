import re

with open('frontend/src/pages/UserDashboard.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add imports
c = c.replace('import api from "../services/api.js";', 'import api, { advocateApi } from "../services/api.js";\nimport { useNavigate } from "react-router-dom";')

# Add navigate and states
c = c.replace('const [error, setError] = useState(false);', '''const [error, setError] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();''')

# Update useEffect
old_effect = '''  useEffect(() => {
    api.dashboard.getMe()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);'''

new_effect = '''  useEffect(() => {
    api.dashboard.getMe()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));

    if (role === 'advocate') {
      setProfileLoading(true);
      advocateApi.getMyProfile()
        .then(setProfile)
        .catch(err => {
          if (err.response?.status === 404) {
             navigate('/advocate/onboarding');
          }
        })
        .finally(() => setProfileLoading(false));
    }
  }, [role, navigate]);'''

c = c.replace(old_effect, new_effect)

# Update return content if role is advocate but pending/rejected/suspended
role_render_old = '''        {/* Header Section */}
        <AnimatedSection>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">
                {role === "advocate" ? "Advocate Dashboard" : "Citizen Dashboard"}
              </h1>'''

role_render_new = '''        {/* Header Section */}
        <AnimatedSection>
          
          {role === 'advocate' && profile && profile.verification_status !== 'VERIFIED' && (
            <div className="mb-6 p-4 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Profile Status: {profile.verification_status}</p>
                <p className="text-sm mt-1">Your profile is not active yet. You cannot accept consultations or broadcasts until verified.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">
                {role === "advocate" ? "Advocate Dashboard" : "Citizen Dashboard"}
              </h1>'''
              
c = c.replace(role_render_old, role_render_new)

with open('frontend/src/pages/UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
