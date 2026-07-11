import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Landmark, Scale, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../components/AlertBanner.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { services } from '../data/mockData.js';

export default function Home() {
  const { t } = useTranslation();

  const actions = [
    [t('home.actionAI'), '/ai-legal-assistant'],
    [t('home.actionAid'), '/legal-aid'],
    [t('home.actionWomen'), '/women-protection'],
    [t('home.actionDirectory'), '/directory'],
  ];

  const translatedServices = [
    { ...services[0], title: t('services.aiAssistant'), description: t('services.aiAssistantDesc') },
    { ...services[1], title: t('services.legalGuidance'), description: t('services.legalGuidanceDesc') },
    { ...services[2], title: t('services.womenProtection'), description: t('services.womenProtectionDesc') },
    { ...services[3], title: t('services.freeLegalAid'), description: t('services.freeLegalAidDesc') },
    { ...services[4], title: t('services.documentAssistance'), description: t('services.documentAssistanceDesc') },
    { ...services[5], title: t('services.directoryLocator'), description: t('services.directoryLocatorDesc') },
    { ...services[6], title: t('services.caseTracking'), description: t('services.caseTrackingDesc') },
  ];

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-legalGold">{t('home.portalLabel')}</p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy-900 md:text-6xl">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t('heroSubtitle')}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {actions.map(([label, path], index) => (
                <Link
                  className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-bold ${
                    index === 2 ? 'bg-alertRed text-white' : index === 1 ? 'bg-aidGreen text-white' : 'bg-navy-800 text-white'
                  }`}
                  key={path}
                  to={path}
                >
                  {label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div className="court-visual court-columns relative min-h-[420px] overflow-hidden rounded-md p-6 shadow-legal">
            <div className="absolute inset-x-8 top-10 h-2 bg-legalGold" />
            <div className="absolute bottom-10 left-8 right-8 rounded-sm bg-white/95 p-5 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-navy-900 text-legalGold">
                  <Landmark className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-serif text-xl font-bold text-navy-900">{t('home.justiceDesk')}</p>
                  <p className="text-sm text-slate-600">{t('home.justiceDesc')}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-aidGreen" /> {t('home.featureLang')}</p>
                <p className="flex items-center gap-2"><Scale className="h-4 w-4 text-legalGold" /> {t('home.featureDocs')}</p>
                <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-navy-800" /> {t('home.featureLocator')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow={t('home.servicesEyebrow')} title={t('home.servicesTitle')}>
            {t('home.servicesDesc')}
          </SectionHeader>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {translatedServices.map((service) => (
              <ServiceCard key={service.path} {...service} />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <SectionHeader eyebrow={t('home.awarenessEyebrow')} title={t('home.awarenessTitle')}>
            {t('home.awarenessDesc')}
          </SectionHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {[t('home.tip1'), t('home.tip2'), t('home.tip3'), t('home.tip4')].map((item) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-5" key={item}>
                <ShieldAlert className="h-6 w-6 text-legalGold" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold leading-6 text-navy-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <AlertBanner />
    </>
  );
}