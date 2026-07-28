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
      <section className="min-h-screen bg-surface py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleReset}
            type="button"
            className="mb-6 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
          >
            ← Start New Assessment
          </button>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">AI Legal Analysis</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900">Your Legal Guidance</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Main guidance */}
            <div className="card-premium p-6 sm:p-8">
              <div
                className="prose prose-sm prose-slate max-w-none [&_h2]:font-display [&_h2]:text-navy-900 [&_h3]:font-display [&_h3]:text-navy-900 [&_strong]:text-navy-900"
                dangerouslySetInnerHTML={{ __html: (result.guidance || result.answer || '').replace(/\n/g, '<br/>') }}
              />
              {result.disclaimer && (
                <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-400">{result.disclaimer}</p>
              )}
            </div>

            {/* Legal Health Score sidebar */}
            <div className="space-y-4">
              <LegalHealthScore score={result.health_score} />

              {result.suggested_documents?.length > 0 && (
                <div className="card-premium p-5">
                  <h4 className="mb-3 font-display text-sm font-bold text-navy-900">Suggested Documents</h4>
                  <ul className="grid gap-1.5">
                    {result.suggested_documents.map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-xs text-slate-600">
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
      <section className="min-h-screen bg-surface py-12 md:py-20">
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
    <section className="min-h-screen bg-surface py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-legalGold">Guided Legal Intake</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              What Legal Issue Are You Facing?
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Select your issue category for step-by-step guided assistance. Our AI will analyze your situation and provide tailored legal guidance.
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {intakeCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || ShieldAlert;
            return (
              <AnimatedSection key={cat.id} delay={i * 50}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="card-premium group w-full p-5 text-left transition-all duration-300"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 transition-colors group-hover:bg-legalGold/10">
                    <Icon className="h-5 w-5 text-navy-700 transition-colors group-hover:text-legalGold" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-navy-900">{cat.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{cat.desc}</p>
                </button>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
