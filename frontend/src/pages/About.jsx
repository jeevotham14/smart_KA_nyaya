import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';

export default function About() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('about.eyebrow')} title={t('about.title')}>
          {t('about.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[t('about.card1'), t('about.card2'), t('about.card3')].map((item) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-5" key={item}>
              <p className="font-serif text-xl font-bold text-navy-900">{item}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t('about.cardDesc')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}