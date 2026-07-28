import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Languages, Menu, Scale, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navItems = [
  ['nav.home', '/'],
  ['nav.about', '/about'],
  ['nav.aiGuidance', '/ai-legal-guidance'],
  ['nav.women', '/women-protection'],
  ['nav.aid', '/legal-aid'],
  ['nav.docs', '/document-generator'],
  ['nav.locator', '/directory'],
  ['nav.tracker', '/case-tracker'],
  ['Emergency', '/emergency'],
  ['nav.resources', '/resources'],
  ['nav.contact', '/contact'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const nextLang = i18n.language === 'en' ? 'kn' : 'en';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 hover:text-legalGold ${isActive ? 'text-legalGold' : 'text-slate-100'}`;

  return (
    <header
      className={`sticky top-0 z-50 text-white transition-all duration-500 ${
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
              {i18n.language === 'en' ? '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' : 'English'}
            </button>
            <Link
              to="/search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-legalGold hover:text-legalGold hover:shadow-[0_0_15px_rgba(196,154,58,0.15)]"
              aria-label="Global Search"
            >
              <Search className="h-4 w-4" />
            </Link>
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
              {i18n.language === 'en' ? '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' : 'English'}
            </button>
            <Link
              to="/search"
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/20 transition-all duration-300 hover:border-legalGold hover:text-legalGold"
              aria-label="Global Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link className="flex-1 rounded-full bg-legalGold px-4 py-2 text-center text-sm font-bold text-navy-900" to="/login">
              {t('login')}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}