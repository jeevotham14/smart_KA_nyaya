import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, Eye, Save, Sparkles, X, ChevronRight, ArrowLeft, ArrowRight,
  Clock, CheckCircle2, Shield, Download, Printer, Copy, Check, Sliders, RefreshCw,
  Globe, Plus, Trash2, ArrowUp, ArrowDown, PlusCircle, Star, Zap, ChevronUp
} from 'lucide-react';
import { DOCUMENT_CATALOG, CATEGORIES } from '../data/documentCatalog.js';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';
import DownloadButtons from '../components/DownloadButtons.jsx';
import DocumentPreview from '../components/DocumentPreview.jsx';
import { useDraftManager } from '../components/DraftManager.jsx';
import { getFormattedDraft } from '../data/documentTemplates.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

// Helper to build local draft text fallback using specialized document templates
function buildLocalDraft(docType, answers) {
  return getFormattedDraft(docType, answers);
}

// ── Interactive Sentence Manager Component ──
function SentenceManager({ draft, setDraft }) {
  const lines = useMemo(() => draft.split('\n'), [draft]);

  const updateLine = (idx, newText) => {
    const next = [...lines];
    next[idx] = newText;
    setDraft(next.join('\n'));
  };

  const removeLine = (idx) => {
    const next = lines.filter((_, i) => i !== idx);
    setDraft(next.join('\n'));
  };

  const addLineAfter = (idx) => {
    const next = [...lines];
    next.splice(idx + 1, 0, 'New clause / statement...');
    setDraft(next.join('\n'));
  };

  const moveLine = (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === lines.length - 1)) return;
    const next = [...lines];
    const temp = next[idx];
    next[idx] = next[idx + dir];
    next[idx + dir] = temp;
    setDraft(next.join('\n'));
  };

  const activeCount = lines.filter((l) => l.trim().length > 0).length;

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
      <div className="flex items-center justify-between bg-slate-100 dark:bg-navy-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="h-4 w-4 text-legalGold" /> Sentence & Clause Manager ({activeCount} clauses)
        </span>
        <button
          type="button"
          onClick={() => setDraft(draft + '\nNew clause / statement.')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white dark:text-navy-900 bg-navy-800 dark:bg-legalGold hover:bg-navy-700 dark:hover:bg-yellow-500 px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" /> Add Sentence
        </button>
      </div>

      {lines.map((line, idx) => {
        if (!line.trim()) return null;
        return (
          <div key={idx} className="group relative flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 p-3 shadow-sm hover:border-legalGold/60 transition-all">
            <div className="flex-1">
              <input
                type="text"
                value={line}
                onChange={(e) => updateLine(idx, e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none focus:text-navy-900 dark:focus:text-white font-serif leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                onClick={() => moveLine(idx, -1)}
                title="Move Up"
                disabled={idx === 0}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-navy-900 dark:hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveLine(idx, 1)}
                title="Move Down"
                disabled={idx === lines.length - 1}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-navy-900 dark:hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => addLineAfter(idx)}
                title="Insert Sentence Below"
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400 hover:text-legalGold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeLine(idx)}
                title="Remove Sentence"
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-alertRed transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main DocumentGenerator Page ──
export default function DocumentGenerator() {
  const { t } = useTranslation();

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [quickFilter, setQuickFilter] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favDocs') || '[]'); } catch { return ['Complaint', 'Police Complaint', 'Vakalatnama placeholder']; }
  });

  // Selected Document & Drawer State
  const [selectedDoc, setSelectedDoc] = useState(null);

  // AI Guided Interview Modal State
  const [interviewDoc, setInterviewDoc] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // Generation & Editor State
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [editorTab, setEditorTab] = useState('sentences'); // 'sentences' | 'editor' | 'preview'
  const [copied, setCopied] = useState(false);
  const [isKannada, setIsKannada] = useState(false);

  const { draft, setDraft, saveDraft, saved } = useDraftManager('docGenDraft', '');

  // Toggle favorite
  const toggleFavorite = (docId, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId];
      localStorage.setItem('favDocs', JSON.stringify(next));
      return next;
    });
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return DOCUMENT_CATALOG.filter((doc) => {
      // Category filter
      if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
      // Quick filter
      if (quickFilter === 'Popular' && !doc.popular) return false;
      if (quickFilter === 'Favorites' && !favorites.includes(doc.id)) return false;
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchDesc = doc.shortDesc.toLowerCase().includes(q);
        const matchCat = doc.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [searchQuery, activeCategory, quickFilter, favorites]);

  // Group by category for structured layout
  const groupedCatalog = useMemo(() => {
    const map = {};
    filteredCatalog.forEach((doc) => {
      if (!map[doc.category]) map[doc.category] = [];
      map[doc.category].push(doc);
    });
    return map;
  }, [filteredCatalog]);

  // Start AI Interview
  const startInterview = (doc) => {
    setSelectedDoc(null);
    setInterviewDoc(doc);
    setCurrentStep(0);
    setAnswers({
      type: doc.id,
      district: DISTRICT_NAMES[0],
      issueDate: new Date().toISOString().split('T')[0],
      courtName: 'HIGH COURT OF KARNATAKA',
      place: 'Bengaluru',
    });
  };

  // Handle Interview Answer Change
  const handleAnswerChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Submit AI Interview & Generate Document
  const handleCompleteInterview = async () => {
    setGenerating(true);
    setInterviewDoc(null);
    try {
      const document = await legalApi.generateDocument(answers);
      const contentText = document.content_text || buildLocalDraft(answers.type, answers);
      setDraft(contentText);
      setGeneratedDoc({ title: answers.type, content: contentText });
    } catch {
      const fallbackText = buildLocalDraft(answers.type, answers);
      setDraft(fallbackText);
      setGeneratedDoc({ title: answers.type, content: fallbackText });
    } finally {
      setGenerating(false);
      setEditorTab('sentences');
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print
  const handlePrint = () => window.print();

  // Translation Mock Toggle
  const toggleKannadaTranslation = () => {
    if (!isKannada) {
      setDraft((prev) => `[ಕನ್ನಡ ಆವೃತ್ತಿ / KANNADA VERSION]\n\n` + prev + `\n\n[ಗಮನಿಸಿ: ಈ ಕರಡನ್ನು ಕಾನೂನು ನೆರವಿಗಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ.]`);
      setIsKannada(true);
    } else {
      setDraft((prev) => prev.replace(`[ಕನ್ನಡ ಆವೃತ್ತಿ / KANNADA VERSION]\n\n`, '').replace(`\n\n[ಗಮನಿಸಿ: ಈ ಕರಡನ್ನು ಕಾನೂನು ನೆರವಿಗಾಗಿ ತಯಾರಿಸಲಾಗಿದೆ.]`, ''));
      setIsKannada(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ── SECTION 1: HERO & SEARCH BAR ── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-navy-900/60 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-legalGold/10 rounded-full blur-[140px]" />
          <div className="absolute top-10 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-legalGold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> AI Legal Document Studio
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-5xl md:text-6xl">
              Documents
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Generate legally formatted documents in minutes using AI.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 mx-auto max-w-2xl"
          >
            <div className="relative flex items-center shadow-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900/90 backdrop-blur-xl focus-within:ring-2 focus-within:ring-legalGold/50 transition-all">
              <Search className="absolute left-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents... (e.g. Police, Vakalatnama, RTI, Rental)"
                className="w-full bg-transparent pl-12 pr-10 py-4 text-sm sm:text-base text-navy-900 dark:text-white placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1 text-slate-400 hover:text-navy-900 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Quick Filter Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {[
              { id: 'All', label: 'All Documents' },
              { id: 'Popular', label: '🔥 Popular' },
              { id: 'Favorites', label: '⭐ Pinned / Favorites' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setQuickFilter(filter.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  quickFilter === filter.id
                    ? 'bg-navy-900 dark:bg-legalGold text-white dark:text-navy-950 shadow'
                    : 'bg-white/80 dark:bg-navy-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-navy-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ── SECTION 2: CATEGORIZED CARDS & GENERATED EDITOR VIEW ── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* GENERATING SHIMMER SKELETON */}
          {generating && (
            <div className="mb-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-12 text-center shadow-lg glass-panel animate-pulse">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-legalGold/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-legalGold animate-spin" />
                </div>
              </div>
              <h3 className="mt-6 font-serif text-2xl font-bold text-navy-900 dark:text-white">
                Drafting Legally Formatted Document…
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Applying Karnataka High Court formatting guidelines and statutory clauses.
              </p>
              <div className="mt-6 max-w-md mx-auto h-2 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-legalGold w-2/3 animate-shimmer" />
              </div>
            </div>
          )}

          {/* GENERATED EDITOR VIEW (when a document is generated) */}
          {generatedDoc && !generating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-xl glass-panel overflow-hidden"
            >
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-legalGold/10 text-legalGold">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-legalGold">Generated Draft</span>
                    <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                      {generatedDoc.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGeneratedDoc(null)}
                    className="text-xs font-bold text-slate-500 hover:text-navy-900 dark:hover:text-white px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    ← Back to Catalog
                  </button>
                </div>
              </div>

              {/* Floating Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 px-6 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-aidGreen" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                  <button
                    onClick={() => saveDraft(draft)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" /> {saved ? 'Saved!' : 'Save Draft'}
                  </button>
                  <button
                    onClick={toggleKannadaTranslation}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      isKannada
                        ? 'border-legalGold bg-legalGold/10 text-legalGold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" /> {isKannada ? 'English' : 'ಕನ್ನಡ Translate'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <DownloadButtons
                    onPrint={handlePrint}
                    onDownloadPdf={() => alert('Downloading PDF...')}
                    onDownloadDocx={() => alert('Downloading DOCX...')}
                    onSave={() => saveDraft(draft)}
                    saved={saved}
                  />
                </div>
              </div>

              {/* Editor Tabs & View */}
              <div className="p-6">
                <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                  <button
                    onClick={() => setEditorTab('sentences')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      editorTab === 'sentences'
                        ? 'border-legalGold text-navy-900 dark:text-legalGold'
                        : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5 text-legalGold" /> Add / Remove Sentences
                  </button>
                  <button
                    onClick={() => setEditorTab('editor')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                      editorTab === 'editor'
                        ? 'border-legalGold text-navy-900 dark:text-legalGold'
                        : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-white'
                    }`}
                  >
                    Free Text Editor
                  </button>
                  <button
                    onClick={() => setEditorTab('preview')}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                      editorTab === 'preview'
                        ? 'border-legalGold text-navy-900 dark:text-legalGold'
                        : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-white'
                    }`}
                  >
                    Print Preview
                  </button>
                </div>

                {editorTab === 'sentences' ? (
                  <SentenceManager draft={draft} setDraft={setDraft} />
                ) : editorTab === 'editor' ? (
                  <textarea
                    className="w-full min-h-[500px] resize-y rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-6 text-sm leading-7 text-slate-800 dark:text-slate-200 outline-none focus:border-legalGold font-mono custom-scrollbar"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-4 min-h-[500px]">
                    <DocumentPreview content={draft} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-10 custom-scrollbar whitespace-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-navy-900 dark:bg-legalGold text-white dark:text-navy-950 shadow-md'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-legalGold'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Empty Search Result State */}
          {Object.keys(groupedCatalog).length === 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-12 text-center shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 font-serif text-xl font-bold text-navy-900 dark:text-white">
                No documents found matching "{searchQuery}"
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try searching for general terms like "Complaint", "Notice", "Police", or clear your filter.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); setQuickFilter('All'); }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-navy-700"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Grouped Category Cards Grid */}
          <div className="space-y-12">
            {Object.entries(groupedCatalog).map(([categoryName, docs]) => {
              return (
                <div key={categoryName}>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="font-serif text-2xl font-extrabold text-navy-900 dark:text-white">
                      {categoryName}
                    </h2>
                    <span className="rounded-full bg-slate-200 dark:bg-navy-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {docs.length}
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => {
                      const IconComp = doc.icon;
                      const isFav = favorites.includes(doc.id);

                      return (
                        <motion.div
                          key={doc.id}
                          whileHover={{ y: -4, scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedDoc(doc)}
                          className="group relative cursor-pointer flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm hover:shadow-xl hover:border-legalGold/50 glass-panel transition-all"
                        >
                          <div>
                            {/* Card Header & Badge */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800/80 text-navy-900 dark:text-legalGold group-hover:scale-110 transition-transform">
                                <IconComp className="h-6 w-6" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${doc.badgeColor}`}>
                                  {doc.category}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite(doc.id, e)}
                                  className="text-slate-300 hover:text-amber-400 transition-colors p-1"
                                  title={isFav ? "Remove Favorite" : "Add Favorite"}
                                >
                                  <Star className={`h-4 w-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                                </button>
                              </div>
                            </div>

                            {/* Title & Description */}
                            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white group-hover:text-legalGold transition-colors flex items-center gap-1.5">
                              {doc.title}
                              {doc.popular && <span className="text-xs text-amber-500">🔥</span>}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                              {doc.shortDesc}
                            </p>
                          </div>

                          {/* Footer Details */}
                          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-legalGold" /> {doc.estimatedTime}
                            </span>
                            <span className="font-semibold text-legalGold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Configure <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── SECTION 3: RIGHT-SIDE SLIDING DRAWER PANEL ── */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoc(null)}
              className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-navy-800/60">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 dark:bg-legalGold text-white dark:text-navy-950 font-bold">
                      {selectedDoc.icon && <selectedDoc.icon className="h-5 w-5" />}
                    </span>
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selectedDoc.badgeColor}`}>
                        {selectedDoc.category}
                      </span>
                      <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {selectedDoc.title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700 hover:text-navy-900 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="p-6 space-y-6">
                  {/* Description & Estimated Time */}
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedDoc.shortDesc}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-legalGold/10 border border-legalGold/30 px-3 py-1 text-xs font-bold text-legalGold">
                      <Clock className="h-3.5 w-3.5" /> Estimated Time: {selectedDoc.estimatedTime}
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="rounded-xl bg-slate-50 dark:bg-navy-950 p-4 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-legalGold mb-1">Purpose</h4>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {selectedDoc.purpose}
                    </p>
                  </div>

                  {/* Typical Use Cases */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white mb-3">
                      Typical Use Cases
                    </h4>
                    <ul className="space-y-2">
                      {selectedDoc.useCases?.map((uc, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-aidGreen shrink-0 mt-0.5" />
                          <span>{uc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Information */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white mb-3">
                      Required Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDoc.requiredInfo?.map((req, i) => (
                        <div key={i} className="rounded-lg bg-slate-100 dark:bg-navy-800/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-legalGold" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900">
                <button
                  onClick={() => startInterview(selectedDoc)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 dark:bg-legalGold py-3.5 px-6 text-sm font-extrabold text-white dark:text-navy-950 shadow-lg hover:shadow-xl hover:bg-navy-800 dark:hover:bg-yellow-500 transition-all"
                >
                  <Sparkles className="h-4 w-4" /> Generate Document (AI Guided)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ── GENERATION FLOW: AI GUIDED INTERVIEW MODAL ── */}
      <AnimatePresence>
        {interviewDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-2xl overflow-hidden glass-panel"
              >
                {/* Progress Bar Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-legalGold/10 text-legalGold font-bold text-xs">
                        AI
                      </span>
                      <span className="text-sm font-bold text-navy-900 dark:text-white">
                        {interviewDoc.title} Builder
                      </span>
                    </div>
                    <span className="text-xs font-bold text-legalGold">
                      Question {currentStep + 1} of {interviewDoc.questions.length}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-legalGold"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / interviewDoc.questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Active Question Input */}
                <div className="p-8">
                  {(() => {
                    const q = interviewDoc.questions[currentStep];
                    if (!q) return null;

                    return (
                      <div>
                        <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white leading-snug">
                          {q.label}
                        </h3>

                        <div className="mt-6">
                          {q.type === 'select' ? (
                            <select
                              value={answers[q.key] || DISTRICT_NAMES[0]}
                              onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
                            >
                              {DISTRICT_NAMES.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          ) : q.type === 'textarea' ? (
                            <textarea
                              rows={5}
                              value={answers[q.key] || ''}
                              onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                              placeholder={q.placeholder || 'Type details here...'}
                              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 font-serif leading-relaxed"
                            />
                          ) : (
                            <input
                              type={q.type || 'text'}
                              value={answers[q.key] || ''}
                              onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                              placeholder={q.placeholder || ''}
                              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 font-serif"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (currentStep > 0) setCurrentStep((s) => s - 1);
                      else setInterviewDoc(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" /> {currentStep === 0 ? 'Cancel' : 'Previous'}
                  </button>

                  {currentStep < interviewDoc.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentStep((s) => s + 1)}
                      className="inline-flex items-center gap-2 rounded-xl bg-navy-900 dark:bg-legalGold px-6 py-2.5 text-xs font-bold text-white dark:text-navy-950 hover:bg-navy-800 dark:hover:bg-yellow-500 transition-all shadow"
                    >
                      Next Question <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteInterview}
                      className="inline-flex items-center gap-2 rounded-xl bg-legalGold px-6 py-2.5 text-xs font-extrabold text-navy-950 hover:bg-yellow-500 transition-all shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" /> Generate Document
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
