import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Bell, BellOff, Calendar, CheckCheck, ChevronRight,
  ClipboardList, FileText, Gavel, Loader2, MapPin, Paperclip, Scale,
  Search, ShieldCheck, Upload, User, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiError, legalApi, notificationApi } from '../services/api.js';
import { karnatakaDistricts } from '../data/karnatakaDistricts.js';
import { DISTRICT_NAMES_KN } from './Directory.jsx';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import CaseTimeline from '../components/CaseTimeline.jsx';
import CaseDetailPanel from '../components/CaseDetailPanel.jsx';


const STATUS_STEPS = [
  { key: 'submitted',    label: 'Filed / Registered', labelKn: 'ದಾಖಲಿಸಲಾಗಿದೆ / ನೋಂದಾಯಿಸಲಾಗಿದೆ', icon: ClipboardList },
  { key: 'under_review', label: 'Under Scrutiny',     labelKn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',             icon: Search },
  { key: 'routed',       label: 'Listed for Hearing', labelKn: 'ವಿಚಾರಣೆಗೆ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ',         icon: Gavel },
  { key: 'resolved',     label: 'Disposed / Closed',  labelKn: 'ತೀರ್ಮಾನಿಸಲಾಗಿದೆ / ಮುಕ್ತಾಯಗೊಂಡಿದೆ',          icon: Scale },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const SEARCH_TABS = [
  { id: 'case_no',   label: 'Case Number', labelKn: 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ', placeholder: 'e.g. CC/00042/2026', placeholderKn: 'ಉದಾ: ಸಿಆರ್‌ಸಿ/೦೦೦೪೨/೨೦೨೬' },
  { id: 'fir',       label: 'FIR Number',  labelKn: 'ಎಫ್‌ಐಆರ್ ಸಂಖ್ಯೆ',  placeholder: 'e.g. FIR/112/2026', placeholderKn: 'ಉದಾ: ಎಫ್‌ಐಆರ್/೧೧೨/೨೦೨೬' },
];

const DISTRICT_LIST = Object.keys(karnatakaDistricts).sort();

function NotificationPanel({ userId }) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setNotifications(await notificationApi.fetchForUser(userId));
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markOne = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => n.notification_id === id ? { ...n, read_status: true } : n)
    );
  };

  const markAll = async () => {
    if (!userId) return;
    await notificationApi.markAllRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        className="relative flex items-center gap-2 rounded border border-slate-300 bg-white dark:bg-navy-900 px-3 py-2 text-sm font-semibold text-navy-900 dark:text-white hover:border-legalGold transition-colors"
        type="button"
      >
        <Bell className="h-4 w-4 text-legalGold" />
        {isKn ? 'ಅಧಿಸೂಚನೆಗಳು' : 'Notifications'}
        {unreadCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-alertRed text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <p className="font-bold text-navy-900 dark:text-white">{isKn ? 'ಅಧಿಸೂಚನೆಗಳು' : 'Notifications'}</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAll} className="flex items-center gap-1 text-xs text-slate-500 hover:text-navy-900 dark:hover:text-white" type="button">
                  <CheckCheck className="h-3.5 w-3.5" /> {isKn ? 'ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ' : 'Mark all read'}
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-navy-900 dark:hover:text-white" type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-slate-400">
                <BellOff className="h-8 w-8" />
                <p className="mt-2 text-sm">{isKn ? 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ' : 'No notifications yet'}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notification_id}
                  onClick={() => markOne(n.notification_id)}
                  className={`w-full border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:hover:bg-navy-800 ${!n.read_status ? 'bg-navy-50 dark:bg-navy-950' : ''}`}
                  type="button"
                >
                  <p className="text-xs font-semibold text-navy-900 dark:text-white">{n.message}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({ caseId, onUploadSuccess }) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setUploadError(isKn ? 'ಫೈಲ್ ಗಾತ್ರ 10 MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು' : 'File must be under 10 MB');
      return;
    }
    setFile(selected);
    setUploadError('');
    setUploadSuccess('');
  };

  const upload = async () => {
    if (!file || !caseId) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      await legalApi.uploadCaseDocument(caseId, file);
      setUploadSuccess(isKn ? `"${file.name}" ಪ್ರಕರಣದ ಕಡತಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!` : `"${file.name}" uploaded successfully!`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setUploadError(getApiError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-4">
      <p className="text-xs font-bold text-navy-900 dark:text-white mb-2 flex items-center gap-1.5">
        <Paperclip className="h-3.5 w-3.5 text-legalGold" /> {isKn ? 'ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Attach Supporting Document'}
      </p>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer flex flex-col items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-4 text-center hover:border-legalGold transition-colors"
      >
        <Upload className="h-5 w-5 text-slate-400" />
        {file
          ? <p className="mt-1.5 text-sm font-semibold text-navy-900 dark:text-white">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          : <p className="mt-1.5 text-xs text-slate-500">{isKn ? 'ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ (PDF, Image)' : 'Click or drag & drop a file here'}</p>
        }
        <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={handleFile} />
      </div>
      {uploadError && <p className="mt-2 rounded bg-red-50 p-2 text-xs font-semibold text-alertRed">{uploadError}</p>}
      {uploadSuccess && <p className="mt-2 rounded bg-emerald-50 p-2 text-xs font-semibold text-aidGreen">{uploadSuccess}</p>}
      <button
        onClick={upload}
        disabled={!file || uploading}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded bg-navy-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-navy-700 transition-colors"
        type="button"
      >
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" />{isKn ? 'ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Uploading…'}</> : <><Upload className="h-4 w-4" />{isKn ? 'ಪ್ರಕರಣದ ಕಡತಕ್ಕೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload to Case File'}</>}
      </button>
    </div>
  );
}

function DocumentList({ caseId, refreshTrigger }) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    legalApi.listCaseDocuments(caseId)
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [caseId, refreshTrigger]);

  if (loading) return <p className="text-xs text-slate-400 py-2">{isKn ? 'ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…' : 'Loading documents…'}</p>;
  if (docs.length === 0) return <p className="text-xs text-slate-400 py-2">{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳು ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ.' : 'No documents uploaded yet.'}</p>;

  return (
    <div className="grid gap-1.5">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-legalGold" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-navy-900 dark:text-white">{doc.filename}</p>
            <p className="text-xs text-slate-400">{doc.size_kb} KB</p>
          </div>
          <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-aidGreen" title="Verified upload" />
        </div>
      ))}
    </div>
  );
}

export default function CaseTracker() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [searchTab, setSearchTab] = useState('case_no');
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState('');
  const [docRefresh, setDocRefresh] = useState(0);

  const activeTabObj = SEARCH_TABS.find((t) => t.id === searchTab);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!district) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Please choose the district');
      setCaseData(null);
      return;
    }
    if (!query.trim()) {
      setError(isKn ? 'ದಯವಿಟ್ಟು ಪ್ರಕರಣ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' : 'Please enter the case number');
      setCaseData(null);
      return;
    }
    setLoading(true);
    setError('');
    setCaseData(null);
    try {
      const data = await legalApi.getCaseStatus(query.trim(), district);
      setCaseData(data);
    } catch (err) {
      setError(getApiError(err) || (isKn ? 'ಪ್ರಕರಣದ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿ ಪ್ರಕರಣ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.' : 'Case details not found. Please verify the case number.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white transition-colors duration-300">
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <Search className="h-3.5 w-3.5" /> {t('caseTracker.eyebrow')}
            </span>
            <NotificationPanel userId="demo-user-id" />
          </div>

          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('caseTracker.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('caseTracker.desc')}
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {SEARCH_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setSearchTab(tab.id); setQuery(''); setCaseData(null); setError(''); }}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  searchTab === tab.id
                    ? 'bg-legalGold text-navy-950 shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
                type="button"
              >
                {isKn ? tab.labelKn : tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="mt-6 mx-auto max-w-2xl">
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] items-center p-2 shadow-lg rounded-2xl border border-white/20 bg-white dark:bg-navy-900/90 backdrop-blur-xl focus-within:ring-2 focus-within:ring-legalGold/50 transition-all">
              
              {/* Mandatory District Dropdown */}
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (e.target.value) setError('');
                }}
                className={`w-full bg-slate-100 dark:bg-navy-800 text-xs sm:text-sm font-semibold text-navy-900 dark:text-white px-3 py-2.5 rounded-xl border ${
                  !district ? 'border-amber-400 dark:border-amber-500/50' : 'border-slate-200 dark:border-slate-700'
                } outline-none focus:border-legalGold`}
              >
                <option value="">{isKn ? '-- ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Required) * --' : '-- Choose District (Required) * --'}</option>
                {DISTRICT_LIST.map((dist) => (
                  <option key={dist} value={dist}>
                    {isKn && DISTRICT_NAMES_KN[dist] ? `${DISTRICT_NAMES_KN[dist]} (${dist})` : dist}
                  </option>
                ))}
              </select>

              {/* Case Number / FIR Query input */}
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isKn && activeTabObj?.placeholderKn ? activeTabObj.placeholderKn : activeTabObj?.placeholder}
                  className="w-full bg-transparent pl-9 pr-3 py-2.5 text-xs sm:text-sm text-navy-900 dark:text-white placeholder-slate-400 outline-none font-mono"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !district || !query.trim()}
                className="w-full sm:w-auto rounded-xl bg-navy-900 dark:bg-legalGold px-5 py-2.5 text-xs font-bold text-white dark:text-navy-950 hover:bg-navy-800 dark:hover:bg-yellow-500 disabled:opacity-50 transition-all shadow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isKn ? 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Status')}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ErrorBoundary fallbackTitle="Something went wrong rendering the Case Detail Panel.">
            <CaseDetailPanel 
              caseData={caseData} 
              loading={loading}
              error={error}
              docRefresh={docRefresh} 
              setDocRefresh={setDocRefresh} 
              onRetry={handleSearch}
            />
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
}

