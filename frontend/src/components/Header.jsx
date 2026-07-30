import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Languages, Menu, Scale, Search, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const navItems = [
  ['nav.home', '/'],
  ['nav.about', '/about'],
  ['nav.aiGuidance', '/ai-legal-guidance'],
  ['nav.women', '/women-protection'],
  ['nav.aid', '/legal-aid'],
  ['nav.docsResources', '/document-generator'],
  ['nav.locator', '/directory'],
  ['nav.tracker', '/case-tracker'],
  ['Emergency', '/emergency'],
  ['nav.contact', '/contact'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';
  const nextLang = i18n.language === 'en' ? 'kn' : 'en';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
              <Link
                className="rounded-full bg-legalGold px-5 py-2 text-sm font-bold text-navy-900 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(196,154,58,0.4)] hover:scale-105"
                to="/login"
              >
                {t('login')}
              </Link>
            </div>
            <button className="lg:hidden" onClick={() => setOpen((v) => !v)} type="button" aria-label="Menu">
              {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
        <nav className={`${open ? 'block' : 'hidden'} border-b border-white/10 bg-navy-800/95 backdrop-blur-md lg:block`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="grid gap-3 md:grid-cols-2 lg:flex lg:flex-wrap lg:gap-x-5 lg:gap-y-2">
              {navItems.map(([label, path]) => (
                <NavLink key={path} to={path} className={navLinkClass} onClick={() => setOpen(false)}>
                  {t(label)}
                </NavLink>
              ))}
            </div>
            <div className="flex gap-3 lg:hidden">
              <button
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-3 py-2 text-sm font-bold"
                onClick={() => i18n.changeLanguage(nextLang)}
                type="button"
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
                {i18n.language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </button>
              <button
                onClick={() => { setOpen(false); setSearchModalOpen(true); }}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-legalGold hover:text-legalGold"
                aria-label="Global Search"
                type="button"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link className="flex-1 rounded-full bg-legalGold px-4 py-2 text-center text-sm font-bold text-navy-900" to="/login">
                {t('login')}
              </Link>
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