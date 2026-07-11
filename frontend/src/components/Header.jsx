import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Languages, Menu, Scale, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navItems = [
  ['nav.home', '/'],
  ['nav.about', '/about'],
  ['nav.assistant', '/ai-legal-assistant'],
  ['nav.guidance', '/legal-guidance'],
  ['nav.women', '/women-protection'],
  ['nav.aid', '/legal-aid'],
  ['nav.docs', '/document-generator'],
  ['nav.locator', '/directory'],
  ['nav.tracker', '/case-tracker'],
  ['nav.resources', '/resources'],
  ['nav.contact', '/contact'],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const nextLang = i18n.language === 'en' ? 'kn' : 'en';

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition hover:text-legalGold ${isActive ? 'text-legalGold' : 'text-slate-100'}`;

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white shadow-lg shadow-navy-900/15">
      <div className="border-b border-white/10 bg-navy-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-legalGold text-legalGold">
              <Scale className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-xl font-bold leading-tight">{t('title')}</span>
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-300">{t('header.tagline')}</span>
            </span>
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <button
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-3 py-2 text-sm font-bold hover:border-legalGold hover:text-legalGold"
              onClick={() => i18n.changeLanguage(nextLang)}
              type="button"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {i18n.language === 'en' ? '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' : 'English'}
            </button>
            <Link className="rounded-sm bg-legalGold px-4 py-2 text-sm font-bold text-navy-900" to="/login">
              {t('login')}
            </Link>
          </div>
          <button className="lg:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Menu">
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>
      <nav className={`${open ? 'block' : 'hidden'} border-b border-white/10 bg-navy-800 lg:block`}>
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
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-white/20 px-3 py-2 text-sm font-bold"
              onClick={() => i18n.changeLanguage(nextLang)}
              type="button"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {i18n.language === 'en' ? '\u0c95\u0ca8\u0ccd\u0ca8\u0ca1' : 'English'}
            </button>
            <Link className="flex-1 rounded-sm bg-legalGold px-4 py-2 text-center text-sm font-bold text-navy-900" to="/login">
              {t('login')}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}