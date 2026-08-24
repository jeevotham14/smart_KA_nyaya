import re

with open('frontend/src/pages/LoginRegister.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add role to state
c = c.replace("language_pref: 'English',\n      district: '',\n      taluk: ''\n    });", "language_pref: 'English',\n      district: '',\n      taluk: '',\n      role: 'citizen'\n    });")

role_selector = """              <div className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="citizen" checked={registerValues.role === 'citizen'} onChange={updateRegister} className="text-legalGold focus:ring-legalGold" />
                  Citizen
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="advocate" checked={registerValues.role === 'advocate'} onChange={updateRegister} className="text-legalGold focus:ring-legalGold" />
                  Advocate
                </label>
              </div>"""

c = c.replace("<h3 className=\"font-serif text-2xl font-bold text-navy-900 \ndark:text-white\">{t('auth.registerTitle')}</h3>", "<h3 className=\"font-serif text-2xl font-bold text-navy-900 dark:text-white\">{t('auth.registerTitle')}</h3>\n" + role_selector)

with open('frontend/src/pages/LoginRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
