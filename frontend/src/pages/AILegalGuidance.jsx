import React, { useState } from 'react';
import {
  BookOpen, FileSearch, ShieldCheck, ArrowRight, Sparkles, Scale,
  Bot, AlertTriangle, FileText, CheckCircle2, Loader2, ArrowLeft,
  FolderOpen, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AssistantChat from '../components/AssistantChat.jsx';
import LegalHealthScore from '../components/LegalHealthScore.jsx';
import { legalApi } from '../services/api.js';
import { DOCUMENT_CATALOG } from '../data/documentCatalog.js';

export default function AILegalGuidance() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [activeMode, setActiveMode] = useState('specific'); // 'specific' | 'chat'
  
  // Specific Legal Guidance state
  const [selectedCategory, setSelectedCategory] = useState('consumer');
  const [caseDescription, setCaseDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const CATEGORIES = [
    { id: 'consumer', name: 'Consumer & Fraud', nameKn: 'ಗ್ರಾಹಕ ದೂರು & ಸೈಬರ್ ವಂಚನೆ', icon: '🛒' },
    { id: 'criminal', name: 'Police FIR & Criminal', nameKn: 'ಪೋಲಿಸ್ ಎಫ್‌ಐಆರ್ & ಕ್ರಿಮಿನಲ್', icon: '🚨' },
    { id: 'domestic_violence', name: 'Domestic Violence & Safety', nameKn: 'ಗೃಹ ಹಿಂಸೆ ರಕ್ಷಣೆ', icon: '🛡️' },
    { id: 'tenant', name: 'Landlord & Tenant Dispute', nameKn: 'ಮನೆ ಬಾಡಿಗೆ & ಆಸ್ತಿ ವಿವಾದ', icon: '🏠' },
    { id: 'labour', name: 'Employment & Unpaid Wages', nameKn: 'ಉದ್ಯೋಗ & ವೇತನ ವಿವಾದ', icon: '💼' },
    { id: 'cyber', name: 'Cyber Crime & Online Fraud', nameKn: 'ಸೈಬರ್ ಅಪರಾಧ ದೂರು', icon: '💻' },
    { id: 'property', name: 'Property & Partition', nameKn: 'ಆಸ್ತಿ ಮತ್ತು ಹಕ್ಕು ಸ್ವಾಮ್ಯ', icon: '📜' },
    { id: 'family', name: 'Family & Marriage Matters', nameKn: 'ಕುಟುಂಬ & ವೈವಾಹಿಕ ವಿಷಯಗಳು', icon: '⚖️' },
  ];

  const handleSpecificAnalysisSubmit = async (e) => {
    e?.preventDefault();
    if (!caseDescription.trim()) return;

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    const catObj = CATEGORIES.find(c => c.id === selectedCategory);

    try {
      const data = await legalApi.submitIntake({
        category: selectedCategory,
        categoryLabel: catObj ? (isKn ? catObj.nameKn : catObj.name) : selectedCategory,
        answers: {
          description: caseDescription.trim(),
          category: selectedCategory,
          language: isKn ? 'Kannada' : 'English',
        },
      });

      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to generate legal analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickNotes = [
    [t('aiAssistant.note1Title'), t('aiAssistant.note1Desc')],
    [t('aiAssistant.note2Title'), t('aiAssistant.note2Desc')],
    [t('aiAssistant.note3Title'), t('aiAssistant.note3Desc')],
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <ShieldCheck className="h-3.5 w-3.5" /> {t('aiAssistant.eyebrow')}
            </p>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {isKn ? 'ಉನ್ನತ AI ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ' : 'AI Legal Guidance Engine'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
              {isKn
                ? 'ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ ಮತ್ತು ಕಾನೂನು ವಿಶ್ಲೇಷಣೆ, ಅನ್ವಯವಾಗುವ ಕಾಯ್ದೆಗಳು ಮತ್ತು ಸೂಕ್ತ ದಾಖಲೆಗಳ ಸಲಹೆ ಪಡೆಯಿರಿ.'
                : 'Get tailored LLM analysis, legal health scores, applicable Indian/Karnataka acts, and recommended document drafts for your specific legal case.'}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveMode('specific')}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all shadow-md ${
                  activeMode === 'specific'
                    ? 'bg-legalGold text-navy-950 ring-2 ring-yellow-400'
                    : 'bg-navy-900/80 text-slate-200 border border-white/20 hover:bg-navy-800'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {isKn ? '🎯 ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣದ AI ವಿಶ್ಲೇಷಣೆ' : '🎯 Specific Legal Guidance (LLM)'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('chat')}
                className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all shadow-md ${
                  activeMode === 'chat'
                    ? 'bg-legalGold text-navy-950 ring-2 ring-yellow-400'
                    : 'bg-navy-900/80 text-slate-200 border border-white/20 hover:bg-navy-800'
                }`}
              >
                <Bot className="h-4 w-4" />
                {isKn ? '💬 ಸಾಮಾನ್ಯ ಕಾನೂನು ಚಾಟ್' : '💬 General AI Assistant Chat'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      {/* Main Content Body */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Quick Notes Row */}
          <div className="grid gap-6 sm:grid-cols-3 mb-10">
            {quickNotes.map(([title, text], index) => {
              const Icon = index === 0 ? BookOpen : index === 1 ? FileSearch : ShieldCheck;
              return (
                <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel transition-all hover:-translate-y-1" key={title}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800 mb-3">
                    <Icon className="h-5 w-5 text-legalGold" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold text-navy-900 dark:text-white">{title}</p>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">{text}</p>
                </article>
              );
            })}
          </div>

          {/* MODE 1: SPECIFIC LEGAL GUIDANCE ENGINE */}
          {activeMode === 'specific' && (
            <div className="space-y-8 animate-scale-in">
              {!analysisResult ? (
                <div className="rounded-3xl border border-legalGold/30 bg-white dark:bg-navy-900 p-8 shadow-xl glass-panel relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-legalGold to-yellow-300" />
                  
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legalGold/20 text-legalGold">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {isKn ? 'ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣದ AI ವಿಶ್ಲೇಷಣೆ' : 'Get Specific Case Legal Guidance'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {isKn ? 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ - LLM ತಕ್ಷಣವೇ ಕಾನೂನು ಹಕ್ಕುಗಳು & ಪರಿಹಾರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.' : 'Provide your specific situation details for tailored LLM analysis & action steps.'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSpecificAnalysisSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                        {isKn ? '1. ಕಾನೂನು ವಿಷಯದ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : '1. Select Issue Category:'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                              selectedCategory === cat.id
                                ? 'border-legalGold bg-legalGold/10 ring-2 ring-legalGold/40 text-navy-900 dark:text-white font-bold'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xl mb-1">{cat.icon}</span>
                            <span className="text-xs">{isKn ? cat.nameKn : cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Case Description Textarea */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        {isKn ? '2. ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣ / ಸಮಸ್ಯೆಯ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ:' : '2. Describe Your Specific Situation / Case Facts:'}
                      </label>
                      <textarea
                        rows={5}
                        value={caseDescription}
                        onChange={(e) => setCaseDescription(e.target.value)}
                        placeholder={
                          isKn
                            ? "ಉದಾಹರಣೆಗೆ: 'ನಾನು ಬೆಂಗಳೂರಿನಲ್ಲಿ ಮನೆ ಬಾಡಿಗೆಗೆ ಇದ್ದು, ಮಾಲೀಕರು 1 ಲಕ್ಷ ರೂ ಅಡ್ವಾನ್ಸ್ ವಾಪಸ್ ನೀಡಲು ನಿರಾಕರಿಸುತ್ತಿದ್ದಾರೆ ಮತ್ತು ಯಾವುದೇ ನೋಟೀಸ್ ನೀಡದೆ ಬೀಗ ಹಾಕಿದ್ದಾರೆ. ನಾನು ಏನು ಮಾಡಬೇಕು?'"
                            : "E.g. 'My employer in Electronic City has withheld 3 months salary (₹1.5 Lakhs) and terminated me without notice. I have bank statements and email records. What legal steps should I take under Karnataka Labour Law?'"
                        }
                        className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-4 text-sm text-navy-900 dark:text-white placeholder-slate-400 outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold transition-all shadow-inner"
                      />
                    </div>

                    {error && (
                      <div className="rounded-xl border border-alertRed/30 bg-alertRed/10 p-4 text-xs font-semibold text-alertRed flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to="/guided-intake"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-legalGold transition-colors"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        {isKn ? 'ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶನ ಮಾದರಿ ಬಯಸುವಿರಾ?' : 'Prefer Step-by-Step Guided Wizard?'}
                      </Link>

                      <button
                        type="submit"
                        disabled={loading || !caseDescription.trim()}
                        className="rounded-xl bg-legalGold px-7 py-3 text-sm font-bold text-navy-950 hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isKn ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…' : 'Analyzing Case with LLM…'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            {isKn ? 'ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ' : 'Generate LLM Legal Guidance'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ANALYSIS RESULT VIEW */
                <div className="space-y-8 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-legalGold transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {isKn ? '← ಹೊಸ ಪ್ರಕರಣದ ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ' : '← Analyze Another Case'}
                    </button>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 text-legalGold" /> LLM Analysis Complete
                    </span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* Main LLM Analysis Card */}
                    <div className="rounded-3xl border border-legalGold/40 bg-white dark:bg-navy-900 p-8 shadow-xl glass-panel relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-legalGold to-yellow-300" />
                      
                      <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        ⚖️ {isKn ? 'ನಿಮ್ಮ ಪ್ರಕರಣದ ನಿರ್ದಿಷ್ಟ ಕಾನೂನು ಸಲಹೆ' : 'Tailored Legal Case Analysis'}
                      </h3>

                      <div className="prose dark:prose-invert max-w-none text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                        {analysisResult.guidance || analysisResult.answer}
                      </div>

                      <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-navy-950 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        {analysisResult.disclaimer}
                      </div>
                    </div>

                    {/* Legal Health Score & Suggested Documents Sidebar */}
                    <div className="space-y-6">
                      {analysisResult.health_score && (
                        <LegalHealthScore score={analysisResult.health_score} />
                      )}

                      {analysisResult.suggested_documents?.length > 0 && (
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel">
                          <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                            <FolderOpen className="h-5 w-5 text-legalGold" />
                            {isKn ? 'ಶಿಫಾರಸು ಮಾಡಿದ ದಾಖಲೆಗಳು' : 'Recommended Draft Documents'}
                          </h4>
                          <div className="space-y-3">
                            {analysisResult.suggested_documents.map((docTitle, idx) => {
                              // Try to find matching doc in catalog
                              const matched = DOCUMENT_CATALOG.find(d => 
                                d.title.toLowerCase().includes(docTitle.toLowerCase()) || 
                                docTitle.toLowerCase().includes(d.title.toLowerCase())
                              );
                              const targetId = matched ? matched.id : 'Complaint';

                              return (
                                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 p-3.5 flex items-center justify-between">
                                  <span className="text-xs font-semibold text-navy-900 dark:text-white">{docTitle}</span>
                                  <Link
                                    to={`/document-generator?doc=${targetId}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-legalGold hover:underline"
                                  >
                                    {isKn ? 'ಕರಡು ತಯಾರಿಸಿ' : 'Draft'} →
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: GENERAL ASSISTANT CHAT */}
          {activeMode === 'chat' && (
            <div className="animate-scale-in">
              <AssistantChat />
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
