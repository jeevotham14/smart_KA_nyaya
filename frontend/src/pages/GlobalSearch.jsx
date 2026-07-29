import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, FileText, Book, FolderOpen, Scale, Bot, MapPin, ArrowRight,
  Shield, Phone, Sparkles, Loader2, ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { legalApi } from '../services/api';
import { DOCUMENT_CATALOG } from '../data/documentCatalog.js';
import { DISTRICT_NAMES_KN } from './Directory.jsx';

export default function GlobalSearch() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  
  const [aiAnswer, setAiAnswer] = useState(null);
  const [matchingDocs, setMatchingDocs] = useState([]);
  const [matchingDirectory, setMatchingDirectory] = useState([]);

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setAiAnswer(null);
    setMatchingDocs([]);
    setMatchingDirectory([]);

    try {
      // 1. Fetch AI Answer for the question
      const aiPromise = legalApi.askAssistant({
        query: searchQuery,
        language: isKn ? 'Kannada' : 'English',
      });

      // 2. Search matching document templates
      const qLower = searchQuery.toLowerCase();
      const docsMatches = DOCUMENT_CATALOG.filter((doc) => {
        const titleMatch = (doc.title || '').toLowerCase().includes(qLower) || (doc.titleKn || '').includes(qLower);
        const descMatch = (doc.shortDesc || '').toLowerCase().includes(qLower) || (doc.shortDescKn || '').includes(qLower);
        const purposeMatch = (doc.purpose || '').toLowerCase().includes(qLower) || (doc.purposeKn || '').includes(qLower);
        const useCaseMatch = (doc.useCases || []).some(uc => uc.toLowerCase().includes(qLower));
        return titleMatch || descMatch || purposeMatch || useCaseMatch;
      });

      // 3. Search directory services
      const dirPromise = legalApi.searchDirectory({ q: searchQuery });

      const [aiRes, dirData] = await Promise.all([aiPromise, dirPromise.catch(() => [])]);

      setAiAnswer(aiRes);
      setMatchingDocs(docsMatches);
      setMatchingDirectory(dirData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery, i18n.language]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
    executeSearch(query.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-10 transition-colors duration-300">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center animate-scale-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <Sparkles className="h-3.5 w-3.5" /> {isKn ? 'AI ಕಾನೂನು ಪ್ರಶ್ನೋತ್ತರ & ಜಾಗತಿಕ ಹುಡುಕಾಟ' : 'AI Legal Answers & Global Search'}
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-navy-900 dark:text-white sm:text-5xl">
            {isKn ? 'ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ' : 'Ask Any Legal Question'}
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {isKn
              ? 'ಕರ್ನಾಟಕದ ಕಾನೂನುಗಳು, ಹಕ್ಕುಗಳು, ಪೋಲಿಸ್ ದೂರು, ಬಾಡಿಗೆ ಒಪ್ಪಂದಗಳು, ಅಥವಾ ಉಚಿತ ಕಾನೂನು ನೆರವಿನ ಬಗ್ಗೆ ನೇರ ಉತ್ತರ ಪಡೆಯಿರಿ.'
              : 'Get immediate AI legal answers, applicable acts, relevant courts, and legal document templates for any query.'}
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative mb-10 max-w-3xl mx-auto">
          <div className="relative flex items-center shadow-xl rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-900 backdrop-blur-xl focus-within:ring-2 focus-within:ring-legalGold/50 transition-all">
            <Search className="absolute left-4 h-6 w-6 text-legalGold" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಮನೆ ಬಾಡಿಗೆ ಕರಾರು ನಿಯಮಗಳು, ಚೆಕ್ ಬೌನ್ಸ್ ಶಿಕ್ಷೆ, ಅಥವಾ FIR ದೂರು..." : "E.g. What to do if employer refuses wages? How to file FIR for UPI fraud?"}
              className="w-full bg-transparent py-4 pl-14 pr-36 text-base text-navy-900 dark:text-white placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2.5 rounded-xl bg-legalGold px-6 py-2.5 text-sm font-bold text-navy-950 hover:bg-yellow-400 disabled:opacity-50 transition-all shadow"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isKn ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ…' : 'Analyzing…'}
                </span>
              ) : (
                isKn ? 'ಉತ್ತರ ಪಡೆಯಿರಿ' : 'Search AI'
              )}
            </button>
          </div>
        </form>

        {/* Results Container */}
        {loading && (
          <div className="my-16 flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm glass-panel">
            <Loader2 className="h-10 w-10 animate-spin text-legalGold mb-4" />
            <p className="font-serif text-xl font-bold text-navy-900 dark:text-white">
              {isKn ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಕಾನೂನು ಉತ್ತರವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…' : 'Consulting AI Legal Intelligence & Statutes…'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {isKn ? 'ಕರ್ನಾಟಕದ ಕಾಯ್ದೆಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶಿ ಸೂತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.' : 'Searching Karnataka Police Acts, Court precedents, and document templates.'}
            </p>
          </div>
        )}

        {!loading && aiAnswer && (
          <div className="space-y-8 animate-scale-in">
            
            {/* AI Direct Answer Card */}
            <div className="rounded-3xl border border-legalGold/40 bg-white dark:bg-navy-900 p-8 shadow-xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-800 via-legalGold to-yellow-300" />
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legalGold/20 text-legalGold">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                      {isKn ? 'AI ಕಾನೂನು ಸಲಹೆ & ಉತ್ತರ' : 'AI Legal Intelligence Answer'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {aiAnswer.provider} • {aiAnswer.model}
                    </p>
                  </div>
                </div>

                {aiAnswer.urgency === 'emergency' && (
                  <a href="tel:112" className="flex items-center gap-2 rounded-xl bg-alertRed px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700">
                    <Phone className="h-4 w-4 animate-bounce" /> {isKn ? '112 ತುರ್ತು ಕರೆ' : 'Call 112 Emergency'}
                  </a>
                )}
              </div>

              {/* Formatted Answer text */}
              <div className="prose dark:prose-invert max-w-none text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {aiAnswer.answer}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <p className="text-xs text-slate-400 italic">
                  ️ {aiAnswer.disclaimer || (isKn ? 'ಸೂಚನೆ: ಇದು ಸಾರ್ವಜನಿಕ ಕಾನೂನು ಅರಿವಿಗಾಗಿ ನೀಡಲಾದ ಮಾಹಿತಿಯಾಗಿದೆ.' : 'Legal Disclaimer: Provided for public legal awareness.')}
                </p>
                <Link
                  to="/ai-legal-guidance"
                  className="premium-btn premium-btn-gold text-xs px-4 py-2"
                >
                  {isKn ? 'ಹೆಚ್ಚಿನ ಕಾನೂನು ಚಾಟ್ ನಡೆಸಿ' : 'Chat Further with AI'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Matching Document Templates */}
            {matchingDocs.length > 0 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel">
                <h3 className="mb-6 flex items-center gap-2 font-serif text-xl font-bold text-navy-900 dark:text-white">
                  <FolderOpen className="h-5 w-5 text-legalGold" />
                  {isKn ? 'ಸಂಬಂಧಿತ ಕಾನೂನು ದಾಖಲೆ ಕರಡುಗಳು' : 'Matching Document Draft Generators'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {matchingDocs.map((doc) => (
                    <div key={doc.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 p-5 transition-all hover:border-legalGold hover:shadow-md">
                      <h4 className="font-bold text-base text-navy-900 dark:text-white">
                        {isKn ? doc.titleKn : doc.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {isKn ? doc.shortDescKn : doc.shortDesc}
                      </p>
                      <Link
                        to={`/document-generator?doc=${doc.id}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-legalGold hover:underline"
                      >
                        {isKn ? 'ಕರಡು ಸಿದ್ಧಪಡಿಸಿ' : 'Prepare Draft'} →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Directory Locations */}
            {matchingDirectory.length > 0 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel">
                <h3 className="mb-6 flex items-center gap-2 font-serif text-xl font-bold text-navy-900 dark:text-white">
                  <MapPin className="h-5 w-5 text-legalGold" />
                  {isKn ? 'ಸಂಬಂಧಿತ ನ್ಯಾಯಾಲಯಗಳು ಮತ್ತು ಕಾನೂನು ನೆರವು ಕೇಂದ್ರಗಳು' : 'Matching Court & Legal Directory Services'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {matchingDirectory.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 p-5">
                      <h4 className="font-bold text-base text-navy-900 dark:text-white">{item.name}</h4>
                      <p className="mt-1 text-xs font-semibold text-legalGold">
                        {item.service_type?.replaceAll('_', ' ')} • {item.district}
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <span>{item.address}</span>
                      </p>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-navy-800 px-3 py-1.5 rounded-lg hover:bg-legalGold hover:text-navy-950 transition-colors">
                          <Phone className="h-3.5 w-3.5" /> Call: {item.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
