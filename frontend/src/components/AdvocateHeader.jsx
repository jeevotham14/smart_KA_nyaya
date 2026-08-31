import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Languages, Menu, Scale, X, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { authApi } from '../services/api.js';
import { getRoleBadge } from '../utils/roleUtils.js';

export default function AdvocateHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';
  const nextLang = i18n.language === 'en' ? 'kn' : 'en';

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const role = localStorage.getItem('role');
  const roleBadge = getRoleBadge(role);

  let displayName = 'Advocate';
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const val = parsed?.name || parsed?.full_name;
      displayName = typeof val === 'string' ? val : 'Advocate';
    }
  } catch {
    displayName = 'Advocate';
  }

  // Dedicated Advocate Navigation
  const navItems = [
    { label: isKn ? 'ವಕೀಲರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Advocate Dashboard', path: '/advocate/dashboard' },
    { label: isKn ? 'ನೇರ ಕೋರಿಕೆಗಳು' : 'Direct Requests', path: '/consultations' },
    { label: isKn ? 'ಪ್ರಸಾರ ಕೋರಿಕೆಗಳು' : 'Broadcast Requests', path: '/consultation-broadcasts' },
    { label: isKn ? 'ನನ್ನ ಸಮಾಲೋಚನೆಗಳು' : 'My Consultations', path: '/consultations' },
    { label: isKn ? 'ಲಭ್ಯತೆ' : 'Availability', path: '/advocate/availability' },
    { label: isKn ? 'ವೃತ್ತಿಪರ ಪ್ರೊಫೈಲ್' : 'Professional Profile', path: '/advocate/profile' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setOpen(false);
    navigate('/advocate/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 hover:text-legalGold ${isActive ? 'text-legalGold font-bold border-b-2 border-legalGold pb-1' : 'text-slate-100'}`;

  return (
    <header
      className={`relative z-50 text-white transition-all duration-500 ${
        scrolled
          ? 'header-glass shadow-lg shadow-navy-900/20'
          : 'bg-navy-900 shadow-lg shadow-navy-900/15'
      }`}
    >
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/advocate/dashboard" className="flex items-center gap-3 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-legalGold/60 text-legalGold transition-all duration-300 group-hover:border-legalGold group-hover:shadow-[0_0_20px_rgba(196,154,58,0.2)]">
              <Scale className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-xl font-bold leading-tight">
                {isKn ? 'ಸ್ಮಾರ್ಟ್ ಕರ್ನಾಟಕ ನ್ಯಾಯ' : 'Smart Karnataka Nyaya'}
              </span>
              <span className="block text-xs uppercase tracking-[0.18em] text-legalGold font-semibold">
                {isKn ? 'ವಕೀಲರ ಕಾರ್ಯಕ್ಷೇತ್ರ' : 'Advocate Workspace'}
              </span>
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition-all duration-300 hover:border-legalGold hover:text-legalGold hover:shadow-[0_0_15px_rgba(196,154,58,0.15)]"
              onClick={() => i18n.changeLanguage(nextLang)}
              type="button"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>

            <div className="flex items-center gap-3">
              <ErrorBoundary fallback={null}>
                <NotificationBell />
              </ErrorBoundary>

              <Link
                to="/advocate/profile"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20"
                title={displayName}
              >
                <User className="h-3.5 w-3.5 text-legalGold" />
                <span className="max-w-[140px] truncate">{displayName}</span>
                {roleBadge && (
                  <span className="rounded bg-legalGold px-1.5 py-0.5 text-[10px] uppercase font-black text-navy-950">
                    {roleBadge}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-slate-300 hover:text-alertRed hover:border-red-400/50 transition-all"
                title="Logout"
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ErrorBoundary fallback={null}>
              <NotificationBell />
            </ErrorBoundary>
            <button className="p-1" onClick={() => setOpen((v) => !v)} type="button" aria-label="Menu">
              {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className={`${open ? 'block' : 'hidden'} border-b border-white/10 bg-navy-800/95 backdrop-blur-md lg:block`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="grid gap-3 md:grid-cols-2 lg:flex lg:flex-wrap lg:gap-x-6 items-center">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={navLinkClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Actions in Drawer */}
          <div className="flex flex-col gap-3 lg:hidden pt-3 border-t border-white/10">
            <div className="flex gap-2">
              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-bold"
                onClick={() => i18n.changeLanguage(nextLang)}
                type="button"
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
                {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 truncate font-semibold">
                  {displayName}
                </span>
                {roleBadge && (
                  <span className="rounded bg-legalGold px-1.5 py-0.5 text-[9px] uppercase font-black text-navy-950">
                    {roleBadge}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-alertRed font-bold hover:underline"
                type="button"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
