import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Mail, Phone, MapPin, Globe, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { authApi, getApiError } from '../services/api.js';
import { karnatakaDistricts } from '../data/karnatakaDistricts.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function CitizenRegister() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    language_pref: 'English',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru North',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'district') {
        const taluks = karnatakaDistricts[value] || [];
        updated.taluk = taluks[0] || '';
      }
      return updated;
    });
    if (error) setError('');
  };

  const availableTaluks = form.district && karnatakaDistricts[form.district] ? [...karnatakaDistricts[form.district]].sort() : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Role is strictly citizen - not user editable
      await authApi.register({
        ...form,
        role: 'citizen',
      });

      // Automatically log in
      await authApi.login({
        email: form.email,
        password: form.password,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err) || (isKn ? 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' : 'Registration failed. Please check your details and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-4 border border-blue-200 dark:border-blue-800">
            <User className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-serif font-black text-navy-900 dark:text-white tracking-tight">
            {isKn ? 'ನಾಗರಿಕ ಖಾತೆ ನೋಂದಣಿ' : 'Create Citizen Account'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isKn ? 'ಉಚಿತ ಕಾನೂನು ಸೇವೆಗಳು, AI ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸಮಾಲೋಚನೆಗಾಗಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ' : 'Sign up for free legal aid, AI guidance, and advocate consultations'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs sm:text-sm font-semibold text-alertRed dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {isKn ? 'ಪೂರ್ಣ ಹೆಸರು *' : 'Full Name *'}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={isKn ? "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು" : "e.g. Ramesh Kumar"}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isKn ? 'ಇಮೇಲ್ ವಿಳಾಸ *' : 'Email Address *'}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Phone Number'}
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {isKn ? 'ಪಾಸ್‌ವರ್ಡ್ *' : 'Password *'}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isKn ? 'ಭಾಷೆ' : 'Language'}
                </label>
                <select
                  name="language_pref"
                  value={form.language_pref}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-3 text-sm focus:border-legalGold outline-none"
                >
                  <option value="English">English</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Kannada + English">Kannada + English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isKn ? 'ಜಿಲ್ಲೆ' : 'District'}
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-3 text-sm focus:border-legalGold outline-none"
                >
                  {DISTRICT_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {isKn ? 'ತಾಲೂಕು' : 'Taluk'}
                </label>
                <select
                  name="taluk"
                  value={form.taluk}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-3 text-sm focus:border-legalGold outline-none"
                >
                  {availableTaluks.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-legalGold dark:hover:bg-yellow-500 text-white dark:text-navy-950 py-3.5 text-sm font-bold shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isKn ? 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ' : 'Register & Enter Dashboard')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isKn ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have a citizen account?'}{' '}
              <Link
                to="/citizen/login"
                className="font-bold text-legalGold hover:underline"
              >
                {isKn ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Login here'}
              </Link>
            </p>

            <div>
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {isKn ? '← ಪೋರ್ಟಲ್ ಆಯ್ಕೆಗೆ ಹಿಂತಿರುಗಿ' : '← Back to Portal Selection'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
