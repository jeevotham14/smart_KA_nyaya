import { useState } from 'react';
import { BookOpen, Shield, Scale, FileText, Clock, AlertTriangle } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { legalApi } from '../services/api.js';

const CATEGORIES = [
  'Consumer Rights',
  'Tenant Rights',
  'Employee Rights',
  'Women’s Rights',
  'Right to Information (RTI)',
  'Cybercrime Victims',
  'Domestic Violence',
  'Property Rights',
  'Arrest Rights',
  'Maternity Benefits',
  'Senior Citizen Rights',
  'Motor Vehicle Accidents'
];

export default function RightsExplainer() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRights = async (category) => {
    if (!category) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await legalApi.explainRights({ category, language: 'English' });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch rights information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val) {
      fetchRights(val);
    } else {
      setResult(null);
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
              <BookOpen className="h-3.5 w-3.5" /> Education
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Know Your Rights
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Select a category to learn about your legal rights, applicable laws, and procedures.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <div className="bg-surface dark:bg-navy-950 min-h-screen py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="max-w-xl mx-auto mb-10">
              <label className="block text-sm font-medium text-navy-900 dark:text-slate-200 mb-2 text-center">Select Legal Category</label>
              <select 
                value={selectedCategory}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 px-4 py-4 text-base font-medium text-slate-900 dark:text-white shadow-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold transition-all"
              >
                <option value="">-- Choose a Category --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-legalGold border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-slate-500 font-medium">Compiling legal information...</p>
              </div>
            )}

            {error && <div className="text-center text-alertRed bg-red-50 dark:bg-red-950/30 p-4 rounded-xl border border-red-200 dark:border-red-900/50">{error}</div>}

            {result && !loading && (
              <div className="grid gap-6 md:grid-cols-2 mt-8">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <Shield className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Your Rights</h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-outside pl-4">
                    {result.rights?.map((r, i) => <li key={i}>{r}</li>) || <li>No specific rights listed.</li>}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <Scale className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Applicable Law</h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-outside pl-4">
                    {result.laws?.map((l, i) => <li key={i}>{l}</li>) || <li>Not specified.</li>}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <FileText className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Required Documents</h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-outside pl-4">
                    {result.documents?.map((d, i) => <li key={i}>{d}</li>) || <li>Not specified.</li>}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Authority to Approach</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{result.authority || 'Not specified.'}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <Clock className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Time Limits & Process</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong className="text-navy-900 dark:text-white block mb-1">Time Limit:</strong> 
                      {result.timeLimit || 'Not specified.'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <strong className="text-navy-900 dark:text-white block mb-1">Estimated Process:</strong> 
                      {result.process || 'Not specified.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-legalGold/10 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-legalGold" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-navy-900 dark:text-white">Possible Outcomes</h3>
                  </div>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-outside pl-4">
                    {result.outcomes?.map((o, i) => <li key={i}>{o}</li>) || <li>Not specified.</li>}
                  </ul>
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}
