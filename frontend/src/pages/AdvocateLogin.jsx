import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale, Lock, Mail, Loader2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { authApi, advocateApi, getApiError } from '../services/api.js';
import { isAdvocate } from '../utils/roleUtils.js';

export default function AdvocateLogin() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleMismatch, setRoleMismatch] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (roleMismatch) setRoleMismatch(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');
    setRoleMismatch(false);

    try {
      await authApi.login(form);
      const user = await authApi.me();

      // Check role policy: If not an advocate account, block them
      if (!isAdvocate(user.role)) {
        authApi.logout();
        setRoleMismatch(true);
        setError(isKn ? 'ಈ ಖಾತೆಯು ನಾಗರಿಕ ಪೋರ್ಟಲ್‌ಗೆ ಸೇರಿದೆ.' : 'This account belongs to the Citizen Portal.');
        return;
      }

      // Check if AdvocateProfile exists
      try {
        await advocateApi.getMyProfile();
        navigate('/advocate/dashboard');
      } catch (profileErr) {
        // No profile exists yet -> redirect to onboarding
        navigate('/advocate/onboarding');
      }
    } catch (err) {
      setError(getApiError(err) || (isKn ? 'ಅಮಾನ್ಯ ರುಜುವಾತುಗಳು. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.' : 'Invalid credentials. Please check your advocate email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-legalGold mb-4 border border-legalGold/30 shadow-[0_0_15px_rgba(196,154,58,0.15)]">
            <Scale className="h-7 w-7" />
          </div>
          <div className="inline-block px-3 py-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-legalGold rounded-full bg-legalGold/10 border border-legalGold/30">
            {isKn ? 'ಅಧಿಕೃತ ವಕೀಲರ ಪ್ರವೇಶ' : 'Official Legal Practice'}
          </div>
          <h1 className="text-3xl font-serif font-black text-navy-900 dark:text-white tracking-tight">
            {isKn ? 'ವಕೀಲರ ಪೋರ್ಟಲ್' : 'Advocate Portal'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isKn
              ? 'ಸಮಾಲೋಚನೆ ಕೋರಿಕೆಗಳು, ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಮತ್ತು ನಾಗರಿಕ ಕಾನೂನು ಸೇವೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.'
              : 'Manage consultations, appointment requests and citizen legal-service requests.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-legalGold to-aidGreen" />

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs sm:text-sm font-semibold text-alertRed dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>

              {roleMismatch && (
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/50">
                  <Link
                    to="/citizen/login"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 dark:bg-legalGold px-4 py-2 text-xs font-bold text-white dark:text-navy-950 hover:bg-navy-800 transition-all shadow"
                  >
                    <span>{isKn ? 'ನಾಗರಿಕ ಲಾಗಿನ್‌ಗೆ ಹೋಗಿ' : 'Go to Citizen Login'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {isKn ? 'ವಕೀಲರ ಇಮೇಲ್ ವಿಳಾಸ' : 'Advocate Email Address'}
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
                {isKn ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Password'}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white pl-10 pr-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-legalGold hover:bg-yellow-500 text-navy-950 py-3.5 text-sm font-black shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isKn ? 'ವಕೀಲರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಿ' : 'Enter Advocate Portal')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isKn ? 'ಹೊಸ ವಕೀಲರೇ?' : 'New Advocate?'}{' '}
              <Link
                to="/advocate/register"
                className="font-bold text-legalGold hover:underline"
              >
                {isKn ? 'ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ' : 'Register your practice'}
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
