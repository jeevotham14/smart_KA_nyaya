import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, AlertTriangle, Loader2, BarChart2, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { legalApi, getApiError } from '../services/api.js';

export default function CaseOutcome() {
  const { t } = useTranslation();
  const [caseText, setCaseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const wordCount = caseText.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseText.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await legalApi.predictCaseOutcome(caseText);
      setResult(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 422) {
        setError('Please provide a case description before submitting.');
      } else if (status === 413) {
        setError('The case description is too large. Please shorten the input and try again.');
      } else if (status === 503) {
        setError('The prediction service is temporarily unavailable.');
      } else {
        setError('Unable to connect to the prediction service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const mapConfidenceBand = (band) => {
    switch (band) {
      case 'HIGH_CONFIDENCE_REJECTED': return 'Higher-confidence historical rejection pattern';
      case 'HIGH_CONFIDENCE_ACCEPTED': return 'Higher-confidence historical acceptance pattern';
      case 'UNCERTAIN': return 'Uncertain — Human Review Recommended';
      case 'INSUFFICIENT_INPUT': return 'Insufficient Information';
      default: return band;
    }
  };

  const mapInputQuality = (quality) => {
    switch (quality) {
      case 'INSUFFICIENT_INFORMATION': return 'Insufficient detail';
      case 'LIMITED_INFORMATION': return 'Limited detail';
      case 'SUFFICIENT_INFORMATION': return 'Sufficient detail';
      default: return quality;
    }
  };

  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <BarChart2 className="h-3.5 w-3.5" /> Experimental Tool
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Case Outcome Prediction
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Describe your case in detail to receive an experimental outcome-pattern estimate based on historical Indian Supreme Court appeal data.
          </p>
        </div>
      </section>

      <section className="bg-surface dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel mb-8">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900 dark:text-white">
                  Case Description
                </label>
                <div className="mb-3 text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-50 dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <FileText className="h-5 w-5 shrink-0 text-legalGold" />
                    <p>
                      For better results, provide a detailed case description with relevant facts, timeline, parties, evidence, and procedural history.
                      <br/>
                      <span className="font-semibold">Recommended: 250+ words</span>
                    </p>
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[250px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold transition-colors resize-y"
                  placeholder="Describe the facts of your case, what happened, relevant dates, parties involved, evidence available, previous court orders if any, and the current legal issue..."
                  value={caseText}
                  onChange={(e) => setCaseText(e.target.value)}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Input quality helper text</span>
                  <span className={wordCount < 250 ? 'text-amber-500' : 'text-emerald-500'}>
                    {wordCount} words
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 flex gap-3 text-sm text-alertRed dark:text-red-400 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !caseText.trim()}
                className="premium-btn premium-btn-gold w-full sm:w-auto px-8 py-3.5 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing case description...
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5" />
                    Analyze Case
                  </>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel animate-scale-in">
              <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                Analysis Results
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/50">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Historical Pattern</p>
                  <p className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    {result.prediction.label === 'REJECTED' ? 'Rejected Outcome' : 'Accepted Outcome'}
                  </p>
                </div>
                
                <div className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/50">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Model Probability (Accepted)</p>
                  <p className="text-xl font-bold text-navy-900 dark:text-white">
                    {(result.prediction.probability_class_1 * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Rejected pattern: {(result.prediction.probability_class_0 * 100).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mb-8 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Confidence State</p>
                <p className="text-lg font-medium text-navy-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-legalGold" />
                  {mapConfidenceBand(result.confidence.band)}
                </p>
                {result.confidence.human_review_required && (
                  <div className="mt-4 p-4 rounded-lg bg-legalGold/10 border border-legalGold/20">
                    <p className="font-semibold text-legalGold flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Human Review Recommended
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      The model is not sufficiently confident in this case description. Consider reviewing the matter with a qualified legal professional.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Input Diagnostics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Input Quality</p>
                    <p className="font-medium text-navy-900 dark:text-white">{mapInputQuality(result.input_diagnostics.input_quality)}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Token/Word Count</p>
                    <p className="font-medium text-navy-900 dark:text-white">{result.input_diagnostics.token_count}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Vocabulary Coverage</p>
                    <p className="font-medium text-navy-900 dark:text-white">{(result.input_diagnostics.vocabulary_coverage * 100).toFixed(1)}%</p>
                  </div>
                </div>
                {result.input_diagnostics.distribution_shift_flags?.includes('LOW_VOCABULARY_COVERAGE') && (
                  <div className="mt-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800/30">
                    The language in this description differs substantially from the model's training data, so the estimate may be less reliable.
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p className="font-bold flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5"/> Disclaimer</p>
                <p>This system is an experimental decision-support tool trained on historical Indian Supreme Court appeal data. It does not predict guaranteed court outcomes and does not provide legal advice.</p>
                {result.disclaimer && <p>{result.disclaimer}</p>}
                <p className="mt-2 text-[10px] opacity-70">Model Version: {result.model_version} | Request ID: {result.request_id}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
