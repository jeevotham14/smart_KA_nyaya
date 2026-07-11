import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';

export default function Resources() {
  const { t } = useTranslation();

  const resources = [
    [t('resourcesPage.res1Title'), t('resourcesPage.res1Desc')],
    [t('resourcesPage.res2Title'), t('resourcesPage.res2Desc')],
    [t('resourcesPage.res3Title'), t('resourcesPage.res3Desc')],
    [t('resourcesPage.res4Title'), t('resourcesPage.res4Desc')],
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('resourcesPage.eyebrow')} title={t('resourcesPage.title')}>
          {t('resourcesPage.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {resources.map(([title, description]) => (
            <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm" key={title}>
              <p className="font-serif text-xl font-bold text-navy-900">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              <button className="mt-5 text-sm font-bold text-navy-800" type="button">{t('resourcesPage.readUpdate')}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
