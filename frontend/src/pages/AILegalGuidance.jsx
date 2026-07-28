import { BookOpen, FileSearch, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AssistantChat from '../components/AssistantChat.jsx';
import SectionHeader from '../components/SectionHeader.jsx';

export default function AILegalGuidance() {
  const { t } = useTranslation();

  const quickNotes = [
    [t('aiAssistant.note1Title'), t('aiAssistant.note1Desc')],
    [t('aiAssistant.note2Title'), t('aiAssistant.note2Desc')],
    [t('aiAssistant.note3Title'), t('aiAssistant.note3Desc')],
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeader eyebrow={t('aiAssistant.eyebrow')} title={t('aiAssistant.title')}>
            {t('aiAssistant.desc')}
          </SectionHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickNotes.map(([title, text], index) => {
              const Icon = index === 0 ? BookOpen : index === 1 ? FileSearch : ShieldCheck;
              return (
                <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={title}>
                  <Icon className="h-5 w-5 text-legalGold" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-navy-900">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
                </article>
              );
            })}
          </div>
        </div>
        <div className="mt-8 mb-4 rounded-xl border border-navy-100 bg-navy-50/50 p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy-900">Need specific legal guidance?</h3>
            <p className="mt-1 text-sm text-slate-600">Try our new step-by-step guided intake process for a more accurate analysis.</p>
          </div>
          <Link
            to="/guided-intake"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-navy-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 sm:mt-0"
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
  );
}
