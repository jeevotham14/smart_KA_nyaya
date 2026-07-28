import { useState } from 'react';
import { FileWarning, MapPin, Phone, ShieldAlert, Shield, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts, womenSupportCenters } from '../data/mockData.js';
const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function WomenProtection() {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const guidance = [
    { title: t('women.guidance1Title'), text: t('women.guidance1Text') },
    { title: t('women.guidance2Title'), text: t('women.guidance2Text') },
    { title: t('women.guidance3Title'), text: t('women.guidance3Text') },
    { title: t('women.guidance4Title'), text: t('women.guidance4Text') },
  ];
  const actionChecklist = [t('women.check1'), t('women.check2'), t('women.check3'), t('women.check4'), t('women.check5')];
  
  const filteredCenters = selectedDistrict
    ? womenSupportCenters.filter(c => c.district === selectedDistrict)
    : womenSupportCenters;

  return (
    <>
      {/* ── Premium Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-alertRed/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-alertRed/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-alertRed/30 bg-alertRed/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              <Shield className="h-3.5 w-3.5" /> {t('women.eyebrow')}
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('women.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t('women.desc')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="rounded-2xl border border-red-200/50 bg-red-50/80 dark:bg-red-950/20 dark:border-red-900/50 p-6 backdrop-blur-sm shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-alertRed">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-alertRed dark:text-red-400">{t('women.getHelpNow')}</h3>
                  <p className="mt-2 text-sm leading-6 text-red-900 dark:text-red-200">{t('women.getHelpDesc')}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: t('women.btn112'), number: '112' },
                  { label: t('women.btn181'), number: '181' },
                  { label: t('women.btn1098'), number: '1098' },
                ].map((item) => (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-alertRed px-4 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-alertRed/20 transition-all duration-300"
                    href={`tel:${item.number}`}
                    key={item.number}
                    aria-label={`Call ${item.label}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            
            <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel">
              <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('women.checklist')}</h3>
              <div className="mt-5 grid gap-3">
                {actionChecklist.map((item, index) => (
                  <p className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-navy-800 p-3 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-navy-700" key={item}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-legalGold/10 text-xs font-bold text-legalGold">{index + 1}</span>
                    {item}
                  </p>
                ))}
              </div>
            </aside>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {guidance.map((item) => (
              <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel hover:shadow-md transition-all" key={item.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-alertRed mb-4">
                  <FileWarning className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('women.locatorTitle')}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('women.locatorDesc')}</p>
                <label className="mt-6 block">
                  <span className="text-sm font-semibold text-navy-900 dark:text-slate-200">{t('women.districtLabel')}</span>
                  <select 
                    className="mt-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 transition-all"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">All Districts</option>
                    {DISTRICT_NAMES.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCenters.map((center) => (
                  <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-5 transition-colors hover:border-legalGold/50" key={center.name}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-serif text-lg font-bold text-navy-900 dark:text-white">{center.name}</p>
                        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><MapPin className="h-4 w-4" /> {center.district} - {center.distance}</p>
                      </div>
                      <a href={`tel:${center.phone}`} className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-bold text-navy-800 dark:text-white hover:border-legalGold hover:text-legalGold transition-all">
                        <Phone className="h-4 w-4" /> {center.phone}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
