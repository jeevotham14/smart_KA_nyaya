import { useState } from 'react';
import {
  AlertTriangle, Briefcase, Building2, Car, CreditCard, Heart, Home,
  Monitor, ShieldAlert, ShoppingBag, UserCheck, Users,
} from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import IntakeWizard from '../components/IntakeWizard.jsx';
import LegalHealthScore from '../components/LegalHealthScore.jsx';
import { intakeCategories, intakeFlows } from '../data/intakeFlows.js';
import { legalApi } from '../services/api.js';

const iconMap = {
  ShoppingBag, Home, Users, AlertTriangle, Briefcase, Monitor,
  ShieldAlert, Heart, Car, Building2, UserCheck, CreditCard,
};

export default function GuidedIntake() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const data = await legalApi.submitIntake(payload);
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setResult(null);
    setError('');
  };

  /* ── Results View ── */
  if (result) {
    return (
      <section className="min-h-screen bg-surface dark:bg-navy-950 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleReset}
            type="button"
            className="mb-6 text-sm font-semibold text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Start New Assessment
          </button>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">AI Legal Analysis</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900 dark:text-white">Your Legal Guidance</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main guidance */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
              <div
                className="prose prose-sm prose-slate dark:prose-invert max-w-none [&_h2]:font-display [&_h2]:text-navy-900 dark:[&_h2]:text-white [&_h3]:font-display [&_h3]:text-navy-900 dark:[&_h3]:text-white [&_strong]:text-navy-900 dark:[&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: (result.guidance || result.answer || '').replace(/\n/g, '<br/>') }}
              />
              {result.disclaimer && (
                <p className="mt-6 rounded-xl bg-slate-50 dark:bg-navy-800 p-3 text-xs text-slate-400 dark:text-slate-500">{result.disclaimer}</p>
              )}
            </div>

            {/* Legal Health Score sidebar */}
            <div className="space-y-4">
              <LegalHealthScore score={result.health_score} />

              {result.suggested_documents?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
                  <h4 className="mb-3 font-display text-sm font-bold text-navy-900 dark:text-white">Suggested Documents</h4>
                  <ul className="grid gap-1.5">
                    {result.suggested_documents.map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-legalGold" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── Wizard View ── */
  if (selectedCategory) {
    const flows = intakeFlows[selectedCategory.id] || [];
    return (
      <section className="min-h-screen bg-surface dark:bg-navy-950 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 rounded-2xl border border-alertRed/20 bg-alertRed/5 p-4 text-sm text-alertRed">
              {error}
            </div>
          )}
          <IntakeWizard
            category={selectedCategory}
            steps={flows}
            onSubmit={handleSubmit}
            onBack={() => setSelectedCategory(null)}
            loading={loading}
          />
        </div>
      </section>
    );
  }

  /* ── Category Selection View ── */
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
              <ShieldAlert className="h-3.5 w-3.5" /> Guided Legal Intake
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              What Legal Issue Are You Facing?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Select your issue category for step-by-step guided assistance. Our AI will analyze your situation and provide tailored legal guidance.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="min-h-screen bg-surface dark:bg-navy-950 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {intakeCategories.map((cat, i) => {
              const Icon = iconMap[cat.icon] || ShieldAlert;
              return (
                <AnimatedSection key={cat.id} delay={i * 50}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel group w-full text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-legalGold/30 dark:hover:border-legalGold/30"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-navy-800 transition-colors group-hover:bg-legalGold/10">
                      <Icon className="h-6 w-6 text-navy-700 dark:text-slate-300 transition-colors group-hover:text-legalGold" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-navy-900 dark:text-white">{cat.label}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{cat.desc}</p>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
