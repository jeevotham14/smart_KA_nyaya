import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, taluks } from '../data/mockData.js';
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
  const updateRegister = (event) => setRegisterValues((current) => ({ ...current, [event.target.name]: event.target.value }));

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
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('auth.eyebrow')} title={t('auth.title')}>
          {t('auth.desc')}
        </SectionHeader>
        {(success || error) ? (
          <div className={`mt-6 rounded-sm p-4 text-sm font-semibold ${success ? 'bg-emerald-50 text-aidGreen' : 'bg-red-50 text-alertRed'}`}>
            {success || error}
          </div>
        ) : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <form className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitLogin}>
            <h3 className="font-serif text-2xl font-bold text-navy-900">{t('auth.loginTitle')}</h3>
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="email" onChange={updateLogin} placeholder={t('auth.emailPlaceholder')} required type="email" value={loginValues.email} />
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="password" onChange={updateLogin} placeholder={t('auth.passwordPlaceholder')} required type="password" value={loginValues.password} />
            <button className="rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading === 'login'} type="submit">
              {loading === 'login' ? t('auth.loggingIn') : t('auth.loginBtn')}
            </button>
          </form>
          <form className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitRegister}>
            <h3 className="font-serif text-2xl font-bold text-navy-900">{t('auth.registerTitle')}</h3>
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="name" onChange={updateRegister} placeholder={t('auth.fullNamePlaceholder')} required value={registerValues.name} />
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="email" onChange={updateRegister} placeholder={t('auth.emailPlaceholder')} required type="email" value={registerValues.email} />
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="phone" onChange={updateRegister} placeholder={t('auth.phonePlaceholder')} value={registerValues.phone} />
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="password" onChange={updateRegister} placeholder={t('auth.passwordPlaceholder')} required type="password" value={registerValues.password} />
            <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="language_pref" onChange={updateRegister} value={registerValues.language_pref}>
              <option>English</option>
              <option>Kannada</option>
              <option>Kannada + English</option>
            </select>
            <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="district" onChange={updateRegister} value={registerValues.district}>
              {districts.map((district) => <option key={district}>{district}</option>)}
            </select>
            <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="taluk" onChange={updateRegister} value={registerValues.taluk}>
              {taluks.map((taluk) => <option key={taluk}>{taluk}</option>)}
            </select>
            <button className="rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading === 'register'} type="submit">
              {loading === 'register' ? t('auth.registering') : t('auth.registerBtn')}
            </button>
          </form>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-sm border border-navy-800 px-4 py-2 text-sm font-bold text-navy-800" to="/dashboard">{t('auth.openUserDashboard')}</Link>
          <Link className="rounded-sm border border-navy-800 px-4 py-2 text-sm font-bold text-navy-800" to="/admin">{t('auth.openAdminDashboard')}</Link>
        </div>
      </div>
    </section>
  );
}
