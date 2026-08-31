import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, Lock, Mail, Phone, User, Loader2, AlertCircle, Shield } from 'lucide-react';
import { authApi, getApiError } from '../services/api.js';

export default function AdvocateRegister() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ' : 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Role is set server-side / payload to advocate
      await authApi.register({
        ...form,
        role: 'advocate',
      });

      // Automatically log in
      await authApi.login({
        email: form.email,
        password: form.password,
      });

      // Step 2 is completing professional details on onboarding
      navigate('/advocate/onboarding');
    } catch (err) {
      setError(getApiError(err) || (isKn ? 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' : 'Advocate registration failed. Please verify your details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-legalGold mb-4 border border-legalGold/30">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-serif font-black text-navy-900 dark:text-white tracking-tight">
            {isKn ? 'ವಕೀಲರ ಖಾತೆ ತೆರೆಯಿರಿ' : 'Register Advocate Account'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isKn
              ? 'ಹಂತ 1: ಮೂಲಭೂತ ಖಾತೆ ತೆರೆಯಿರಿ. ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಬಾರ್ ಕೌನ್ಸಿಲ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.'
              : 'Step 1 of 2: Create advocate login credentials before submitting Bar Council details.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-legalGold to-aidGreen" />

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs sm:text-sm font-semibold text-alertRed dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {isKn ? 'ವಕೀಲರ ಪೂರ್ಣ ಹೆಸರು *' : 'Advocate Full Name *'}
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={isKn ? "ಅಡ್ವೋಕೇಟ್ ಸುರೇಶ್ ರಾವ್" : "Adv. Suresh Rao"}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {isKn ? 'ವೃತ್ತಿಪರ ಇಮೇಲ್ ವಿಳಾಸ *' : 'Professional Email Address *'}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="advocate@barcouncil.in"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-legalGold hover:bg-yellow-500 text-navy-950 py-3.5 text-sm font-black shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isKn ? 'ಮುಂದುವರಿಯಿರಿ: ಬಾರ್ ಕೌನ್ಸಿಲ್ ವಿವರಗಳು →' : 'Continue to Onboarding Details →')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isKn ? 'ಈಗಾಗಲೇ ವಕೀಲರ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have an advocate account?'}{' '}
              <Link
                to="/advocate/login"
                className="font-bold text-legalGold hover:underline"
              >
                {isKn ? 'ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ' : 'Login here'}
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
