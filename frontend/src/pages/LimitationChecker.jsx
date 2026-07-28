import { useState } from 'react';
import { Clock } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { legalApi } from '../services/api.js';
import LimitationForm from '../components/LimitationForm.jsx';
import LimitationResult from '../components/LimitationResult.jsx';

export default function LimitationChecker() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const data = await legalApi.checkLimitationPeriod(values);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to check limitation period.');
    } finally {
      setLoading(false);
    }
  };

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
              <Clock className="h-3.5 w-3.5" /> Deadlines
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Limitation Period Checker
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Check the legal time limit to file your case or claim.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <div className="bg-surface dark:bg-navy-950 min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300">
              <LimitationForm onSubmit={handleCheck} loading={loading} />
              {error && <div className="mt-4 rounded-xl border border-alertRed/20 bg-alertRed/5 p-4 text-sm text-alertRed">{error}</div>}
              {result && (
                <div className="mt-8">
                  <LimitationResult result={result} />
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}
