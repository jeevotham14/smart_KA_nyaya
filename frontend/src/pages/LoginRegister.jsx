import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts } from '../data/mockData.js';
import { Shield } from 'lucide-react';
const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();
import { authApi, getApiError } from '../services/api.js';

export default function LoginRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginValues, setLoginValues] = useState({ email: '', password: '' });
  const [registerValues, setRegisterValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    language_pref: 'English',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru North',
  });
  const [loading, setLoading] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateLogin = (event) => setLoginValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateRegister = (event) => {
    const { name, value } = event.target;
    setRegisterValues((current) => {
      const newValues = { ...current, [name]: value };
      if (name === 'district') newValues.taluk = '';
      return newValues;
    });
  };
  const availableTaluks = registerValues.district && karnatakaDistricts[registerValues.district] ? [...karnatakaDistricts[registerValues.district]].sort() : [];

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading('login');
    setError('');
    setSuccess('');
    try {
      await authApi.login(loginValues);
      const user = await authApi.me();
      setSuccess(`Welcome back, ${user.name}.`);
      window.setTimeout(() => navigate('/dashboard'), 500);
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading('');
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setLoading('register');
    setError('');
    setSuccess('');
    try {
      const user = await authApi.register(registerValues);
      setSuccess(`Registered ${user.name}. You can log in now.`);
      setLoginValues({ email: registerValues.email, password: '' });
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading('');
    }
  };

  return (
    <>
      {/* ── Premium Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <Shield className="h-3.5 w-3.5" /> Authentication
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('auth.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t('auth.desc')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {(success || error) ? (
          <div className={`mt-6 rounded-sm p-4 text-sm font-semibold ${success ? 'bg-emerald-50 text-aidGreen' : 'bg-red-50 text-alertRed'}`}>
            {success || error}
          </div>
        ) : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <form className="grid gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel" onSubmit={submitLogin}>
            <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('auth.loginTitle')}</h3>
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="email" onChange={updateLogin} placeholder={t('auth.emailPlaceholder')} required type="email" value={loginValues.email} />
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="password" onChange={updateLogin} placeholder={t('auth.passwordPlaceholder')} required type="password" value={loginValues.password} />
            <button className="rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60" disabled={loading === 'login'} type="submit">
              {loading === 'login' ? t('auth.loggingIn') : t('auth.loginBtn')}
            </button>
          </form>
          <form className="grid gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel" onSubmit={submitRegister}>
            <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('auth.registerTitle')}</h3>
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="name" onChange={updateRegister} placeholder={t('auth.fullNamePlaceholder')} required value={registerValues.name} />
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="email" onChange={updateRegister} placeholder={t('auth.emailPlaceholder')} required type="email" value={registerValues.email} />
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="phone" onChange={updateRegister} placeholder={t('auth.phonePlaceholder')} value={registerValues.phone} />
            <input className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="password" onChange={updateRegister} placeholder={t('auth.passwordPlaceholder')} required type="password" value={registerValues.password} />
            <select className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="language_pref" onChange={updateRegister} value={registerValues.language_pref}>
              <option>English</option>
              <option>Kannada</option>
              <option>Kannada + English</option>
            </select>
            <select className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="district" onChange={updateRegister} value={registerValues.district}>
              <option value="">Select District</option>
              {DISTRICT_NAMES.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <select className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 text-sm focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 outline-none transition-all" name="taluk" onChange={updateRegister} value={registerValues.taluk} disabled={availableTaluks.length === 0}>
              <option value="">Select Taluk</option>
              {availableTaluks.map((taluk) => <option key={taluk} value={taluk}>{taluk}</option>)}
            </select>
            <button className="rounded-xl bg-navy-800 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60" disabled={loading === 'register'} type="submit">
              {loading === 'register' ? t('auth.registering') : t('auth.registerBtn')}
            </button>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-xl border border-navy-800 dark:border-navy-600 px-4 py-2 text-sm font-bold text-navy-800 dark:text-navy-200 transition-all duration-300 hover:bg-navy-50 dark:hover:bg-navy-800" to="/dashboard">{t('auth.openUserDashboard')}</Link>
          <Link className="rounded-xl border border-navy-800 dark:border-navy-600 px-4 py-2 text-sm font-bold text-navy-800 dark:text-navy-200 transition-all duration-300 hover:bg-navy-50 dark:hover:bg-navy-800" to="/admin">{t('auth.openAdminDashboard')}</Link>
        </div>
      </div>
    </section>
    </>
  );
}
