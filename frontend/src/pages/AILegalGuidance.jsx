import { BookOpen, FileSearch, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AssistantChat from '../components/AssistantChat.jsx';

export default function AILegalGuidance() {
  const { t } = useTranslation();

  const quickNotes = [
    [t('aiAssistant.note1Title'), t('aiAssistant.note1Desc')],
    [t('aiAssistant.note2Title'), t('aiAssistant.note2Desc')],
    [t('aiAssistant.note3Title'), t('aiAssistant.note3Desc')],
  ];

  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <ShieldCheck className="h-3.5 w-3.5" /> {t('aiAssistant.eyebrow')}
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('aiAssistant.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t('aiAssistant.desc')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            {quickNotes.map(([title, text], index) => {
              const Icon = index === 0 ? BookOpen : index === 1 ? FileSearch : ShieldCheck;
              return (
                <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" key={title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-navy-800/50 mb-4">
                    <Icon className="h-5 w-5 text-legalGold" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-navy-900 dark:text-white">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">{text}</p>
                </article>
              );
            })}
          </div>
          
          <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel sm:flex sm:items-center sm:justify-between transition-all duration-300 hover:shadow-lg">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Need specific legal guidance?</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Try our new step-by-step guided intake process for a more accurate analysis.</p>
            </div>
            <Link
              to="/guided-intake"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 dark:bg-legalGold px-5 py-2.5 text-sm font-bold text-white dark:text-navy-900 shadow-sm transition-all hover:bg-navy-900 dark:hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-0"
            >
              Start Guided Intake
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="mt-8">
            <AssistantChat />
          </div>
        </div>
      </section>
    </>
  );
}
