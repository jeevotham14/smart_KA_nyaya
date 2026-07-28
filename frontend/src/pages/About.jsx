import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <Info className="h-3.5 w-3.5" /> {t('about.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('about.desc')}
          </p>
        </div>
      </section>
      <section className="bg-white dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[t('about.card1'), t('about.card2'), t('about.card3')].map((item) => (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" key={item}>
                <p className="font-serif text-xl font-bold text-navy-900 dark:text-white">{item}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('about.cardDesc')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}