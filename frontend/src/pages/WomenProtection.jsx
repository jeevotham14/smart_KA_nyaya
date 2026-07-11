import { FileWarning, MapPin, Phone, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../components/AlertBanner.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, womenSupportCenters } from '../data/mockData.js';



export default function WomenProtection() {
  const { t } = useTranslation();
  const guidance = [
    { title: t('women.guidance1Title'), text: t('women.guidance1Text') },
    { title: t('women.guidance2Title'), text: t('women.guidance2Text') },
    { title: t('women.guidance3Title'), text: t('women.guidance3Text') },
    { title: t('women.guidance4Title'), text: t('women.guidance4Text') },
  ];
  const actionChecklist = [t('women.check1'), t('women.check2'), t('women.check3'), t('women.check4'), t('women.check5')];
  return (
    <>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <SectionHeader eyebrow={t('women.eyebrow')} title={t('women.title')}>
              {t('women.desc')}
            </SectionHeader>
            <div className="rounded-md border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-alertRed" aria-hidden="true" />
                <div>
                  <h3 className="font-serif text-2xl font-bold text-alertRed">{t('women.getHelpNow')}</h3>
                  <p className="mt-2 text-sm leading-6 text-red-900">{t('women.getHelpDesc')}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[t('women.btn112'), t('women.btn181'), t('women.btn1098')].map((item) => (
                  <button className="inline-flex items-center justify-center gap-2 rounded-sm bg-alertRed px-4 py-3 text-sm font-bold text-white" key={item} type="button">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-2">
              {guidance.map((item) => (
                <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
                  <FileWarning className="h-6 w-6 text-alertRed" aria-hidden="true" />
                  <h3 className="mt-3 font-serif text-xl font-bold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
            <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-navy-900">{t('women.checklist')}</h3>
              <div className="mt-5 grid gap-3">
                {actionChecklist.map((item, index) => (
                  <p className="flex gap-3 rounded-sm bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700" key={item}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-legalGold text-xs font-bold text-navy-900">{index + 1}</span>
                    {item}
                  </p>
                ))}
              </div>
            </aside>
          </div>

          <section className="mt-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">{t('women.locatorTitle')}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t('women.locatorDesc')}</p>
                <label className="mt-5 block">
                  <span className="text-sm font-semibold text-navy-900">{t('women.districtLabel')}</span>
                  <select className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm">
                    {districts.map((district) => <option key={district}>{district}</option>)}
                  </select>
                </label>
                <button className="mt-4 rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white" type="button">{t('women.findCenter')}</button>
              </div>
              <div className="grid gap-3">
                {womenSupportCenters.map((center) => (
                  <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={center.name}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-serif text-xl font-bold text-navy-900">{center.name}</p>
                        <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4" /> {center.district} - {center.distance}</p>
                      </div>
                      <p className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-2 text-sm font-bold text-navy-800"><Phone className="h-4 w-4" /> {center.phone}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
      <AlertBanner compact />
    </>
  );
}
