import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Languages, Menu, Scale, Search, Sparkles, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { authApi } from '../services/api.js';

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';
  const nextLang = i18n.language === 'en' ? 'kn' : 'en';

  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  let displayName = 'User';
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const val = parsed?.name || parsed?.full_name;
      displayName = typeof val === 'string' ? val : 'User';
    }
  } catch {
    displayName = 'User';
  }

  // ── Navigation Items with All Platform Features ──
  let navItems = [
    ['nav.home', '/'],
    ['nav.aiGuidance', '/ai-legal-guidance'],
    ['Case Outcome', '/case-outcome'],
    ['Consult an Advocate', '/advocates'],
  ];

  if (role === 'citizen') {
    navItems.push(
      ['My Consultations', '/consultations'],
      ['My Broadcast Requests', '/consultation-broadcasts'],
      ['Dashboard', '/dashboard']
    );
  } else if (role === 'advocate') {
    navItems.push(
      ['Advocate Dashboard', '/advocate/dashboard'],
      ['Direct Requests', '/consultations'],
      ['Broadcast Requests', '/consultation-broadcasts'],
      ['My Consultations', '/consultations']
    );
  } else if (role === 'admin') {
    navItems.push(
      ['Admin Dashboard', '/admin']
    );
  }

  // Legal Services & Public Protection
  navItems.push(
    ['nav.women', '/women-protection'],
    ['nav.aid', '/legal-aid'],
    ['nav.docsResources', '/document-generator'],
    ['nav.locator', '/directory'],
    ['nav.tracker', '/case-tracker'],
    ['Emergency', '/emergency'],
    ['nav.about', '/about'],
    ['nav.contact', '/contact']
  );

  const MORE_TOOLS = [
    { name: isKn ? 'ಮಾರ್ಗದರ್ಶಿತ ದೂರು (Guided Intake)' : 'Guided Intake Assessment', path: '/guided-intake' },
    { name: isKn ? 'ನ್ಯಾಯಾಲಯ ಶುಲ್ಕ ಕ್ಯಾಲ್ಕುಲೇಟರ್' : 'Court Fee Calculator', path: '/court-fee-calculator' },
    { name: isKn ? 'ಕಾಲಮಿತಿ ಪರೀಕ್ಷಕ (Limitation)' : 'Limitation Period Checker', path: '/limitation-checker' },
    { name: isKn ? 'ಕಾನೂನು ಹಕ್ಕುಗಳ ವಿವರಣೆ' : 'Legal Rights Explainer', path: '/rights-explainer' },
    { name: isKn ? 'ವಕಾಲತ್‌ನಾಮ ಜನರೇಟರ್' : 'Vakalatnama Generator', path: '/vakalatnama' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setOpen(false);
    navigate('/login');
  };

  const handleModalSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setSearchQuery('');
    setSearchModalOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const QUICK_SUGGESTIONS = isKn ? [
    "ಪೊಲೀಸ್ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸುವ ವಿಧಾನ?",
    "ಉಚಿತ ಕಾನೂನು ನೆರವಿಗೆ ಯಾರು ಅರ್ಹರು?",
    "ಆನ್‌ಲೈನ್ ಸೈಬರ್ ವಂಚನೆ ದೂರು",
    "ಮನೆ ಬಾಡಿಗೆ ಒಪ್ಪಂದ ನಿಯಮಗಳು",
    "ಗೃಹ ಹಿಂಸೆ ರಕ್ಷಣಾ ಆದೇಶ"
  ] : [
    "How to file FIR for UPI fraud?",
    "Who is eligible for free legal aid?",
    "Rental agreement rules in Karnataka",
    "How to get domestic violence protection order?",
    "Cheque bounce notice process"
  ];

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 hover:text-legalGold ${isActive ? 'text-legalGold' : 'text-slate-100'}`;

  return (
    <>
      <header
        className={`relative z-50 text-white transition-all duration-500 ${
          scrolled
            ? 'header-glass shadow-lg shadow-navy-900/20'
            : 'bg-navy-900 shadow-lg shadow-navy-900/15'
        }`}
      >
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-legalGold/60 text-legalGold transition-all duration-300 group-hover:border-legalGold group-hover:shadow-[0_0_20px_rgba(196,154,58,0.2)]">
                <Scale className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-serif text-xl font-bold leading-tight">{t('title')}</span>
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-300">{t('header.tagline')}</span>
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

              <button
                onClick={() => setSearchModalOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-legalGold hover:text-legalGold hover:shadow-[0_0_15px_rgba(196,154,58,0.15)]"
                aria-label="Global Search"
                type="button"
              >
                <Search className="h-4 w-4" />
              </button>

              {token ? (
                <div className="flex items-center gap-3">
                  <ErrorBoundary fallback={null}>
                    <NotificationBell />
                  </ErrorBoundary>

                  <Link
                    to={role === 'advocate' ? '/advocate/dashboard' : role === 'admin' ? '/admin' : '/dashboard'}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/20"
                    title={displayName}
                  >
                    <User className="h-3.5 w-3.5 text-legalGold" />
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <span className="rounded bg-legalGold/20 px-1.5 py-0.5 text-[10px] uppercase font-bold text-legalGold">
                      {role === 'advocate' ? 'Adv' : role === 'admin' ? 'Admin' : 'Citizen'}
                    </span>
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
              ) : (
                <Link
                  className="rounded-full bg-legalGold px-5 py-2 text-sm font-bold text-navy-900 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(196,154,58,0.4)] hover:scale-105"
                  to="/login"
                >
                  {t('login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {token && (
                <ErrorBoundary fallback={null}>
                  <NotificationBell />
                </ErrorBoundary>
              )}
              <button className="p-1" onClick={() => setOpen((v) => !v)} type="button" aria-label="Menu">
                {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className={`${open ? 'block' : 'hidden'} border-b border-white/10 bg-navy-800/95 backdrop-blur-md lg:block`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="grid gap-3 md:grid-cols-2 lg:flex lg:flex-wrap lg:gap-x-5 lg:gap-y-2 items-center">
              {navItems.map(([label, path]) => (
                <NavLink key={path} to={path} className={navLinkClass} onClick={() => setOpen(false)}>
                  {t(label) || label}
                </NavLink>
              ))}

              {/* More Legal Tools Dropdown */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-200 hover:text-legalGold text-slate-100 py-1"
                >
                  <span>{isKn ? 'ಇನ್ನಷ್ಟು ಪರಿಕರಗಳು' : 'More Tools'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180 text-legalGold' : ''}`} />
                </button>

                {toolsOpen && (
                  <div
                    onMouseLeave={() => setToolsOpen(false)}
                    className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-navy-900/95 backdrop-blur-md shadow-2xl z-50 py-2 text-xs"
                  >
                    {MORE_TOOLS.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => { setToolsOpen(false); setOpen(false); }}
                        className="block px-4 py-2.5 text-slate-200 hover:bg-legalGold/10 hover:text-legalGold transition-colors font-medium"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile More Tools Section */}
            <div className="pt-2 border-t border-white/10 lg:hidden">
              <p className="text-xs uppercase font-extrabold tracking-wider text-legalGold mb-2">
                {isKn ? 'ಹೆಚ್ಚುವರಿ ಕಾನೂನು ಪರಿಕರಗಳು' : 'More Legal Tools'}
              </p>
              <div className="grid grid-cols-1 gap-2 pl-2">
                {MORE_TOOLS.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setOpen(false)}
                    className="text-xs text-slate-300 hover:text-legalGold transition-colors"
                  >
                    • {tool.name}
                  </Link>
                ))}
              </div>
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

                <button
                  onClick={() => { setOpen(false); setSearchModalOpen(true); }}
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-legalGold hover:text-legalGold"
                  aria-label="Global Search"
                  type="button"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {token ? (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-300 truncate font-semibold">
                    {displayName} ({role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs text-alertRed font-bold hover:underline"
                    type="button"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-legalGold px-4 py-2 text-center text-sm font-bold text-navy-900"
                  to="/login"
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ── Interactive Search Modal ── */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-legalGold/40 bg-navy-900 p-6 shadow-2xl glass-panel">
            <button
              onClick={() => setSearchModalOpen(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-legalGold mb-3 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              {isKn ? 'AI ಸಾರ್ವತ್ರಿಕ ಕಾನೂನು ಶೋಧಕ' : 'Instant AI Legal Search Engine'}
            </div>

            <form onSubmit={handleModalSearchSubmit}>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-legalGold" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isKn ? "ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ…" : "Ask any legal question or search query…"}
                  className="w-full rounded-2xl border border-white/20 bg-navy-950/80 py-4 pl-12 pr-28 text-base text-white placeholder-slate-400 outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2.5 rounded-xl bg-legalGold px-4 py-2 text-xs font-bold text-navy-950 hover:bg-yellow-400 disabled:opacity-50 transition-all"
                >
                  {isKn ? 'ಉತ್ತರ ಪಡೆಯಿರಿ' : 'Ask AI'}
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-slate-400 mb-3">
                {isKn ? 'ಜನಪ್ರಿಯ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳು:' : 'Popular Legal Questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate(`/search?q=${encodeURIComponent(sug)}`);
                    }}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-legalGold hover:bg-legalGold/10 hover:text-legalGold transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
