import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const links = [
    [t('footer.legalGuidance'), '/legal-guidance'],
    [t('footer.legalAid'), '/legal-aid'],
    [t('footer.womenProtection'), '/women-protection'],
    [t('footer.directoryLocator'), '/directory'],
  ];

  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-legalGold text-legalGold">
              <Scale className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-serif text-xl font-bold">{t('title')}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{t('footer.tagline')}</p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">{t('disclaimer')}</p>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">{t('footer.usefulLinks')}</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            {links.map(([label, path]) => (
              <Link className="hover:text-legalGold" key={path} to={path}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold">{t('footer.contact')}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>{t('footer.location')}</p>
            <p>{t('footer.email')}</p>
            <p>{t('footer.helplines')}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        {t('footer.copyright')}
      </div>
    </footer>
  );
}