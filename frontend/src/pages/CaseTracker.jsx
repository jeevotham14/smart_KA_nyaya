import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, Bell, BellOff, Calendar, CheckCheck, ChevronRight,
  ClipboardList, FileText, Gavel, Loader2, Paperclip, Scale,
  Search, ShieldCheck, Upload, User, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiError, legalApi, notificationApi } from '../services/api.js';
import { karnatakaDistricts } from '../data/mockData.js';

// ── eCourts-style status pipeline ─────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'submitted',    label: 'Filed / Registered',         icon: ClipboardList },
  { key: 'under_review', label: 'Under Scrutiny',             icon: Search },
  { key: 'routed',       label: 'Listed for Hearing',         icon: Gavel },
  { key: 'resolved',     label: 'Disposed / Closed',          icon: Scale },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const SEARCH_TABS = [
  { id: 'case_no',   label: 'Case Number',   placeholder: 'e.g. CC/00042/2026' },
  { id: 'fir',       label: 'FIR Number',    placeholder: 'e.g. FIR/112/2026' },
];

// ── Notification panel ─────────────────────────────────────────────────────────
function NotificationPanel({ userId }) {
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
        className="relative flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy-900 hover:border-legalGold transition-colors"
        type="button"
      >
        <Bell className="h-4 w-4 text-legalGold" />
        Notifications
        {unreadCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-alertRed text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-md border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-bold text-navy-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAll} className="flex items-center gap-1 text-xs text-slate-500 hover:text-navy-900" type="button">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-navy-900" type="button">
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
                <p className="mt-2 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notification_id}
                  onClick={() => markOne(n.notification_id)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${!n.read_status ? 'bg-navy-50' : ''}`}
                  type="button"
                >
                  <div className="flex items-start gap-2">
                    {!n.read_status && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-legalGold" />}
                    <div className={!n.read_status ? '' : 'pl-4'}>
                      <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-600">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Document uploader ─────────────────────────────────────────────────────────
function DocumentUploader({ caseId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);
  const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';
  const MAX_MB = 5;

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_MB * 1024 * 1024) {
      setUploadError(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(selected);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFile({ target: { files: e.dataTransfer.files } });
    }
  };

  const upload = async () => {
    if (!file || !caseId) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const result = await legalApi.uploadCaseDocument(caseId, file);
      setUploadSuccess(`✅ "${result.filename}" uploaded (${result.size_kb} KB). Total: ${result.total_documents}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess?.();
    } catch (err) {
      setUploadError(getApiError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip className="h-4 w-4 text-legalGold" />
        <p className="text-sm font-bold text-navy-900">Upload Document</p>
        <span className="ml-auto text-xs text-slate-400">PDF, JPG, PNG, DOCX — max {MAX_MB} MB</span>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 py-5 text-center hover:border-legalGold transition-colors"
      >
        <Upload className="h-5 w-5 text-slate-400" />
        {file
          ? <p className="mt-1.5 text-sm font-semibold text-navy-900">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          : <p className="mt-1.5 text-xs text-slate-500">Click or drag & drop a file here</p>
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
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading…</> : <><Upload className="h-4 w-4" />Upload to Case File</>}
      </button>
    </div>
  );
}

// ── Uploaded documents list ───────────────────────────────────────────────────
function DocumentList({ caseId, refreshTrigger }) {
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

  if (loading) return <p className="text-xs text-slate-400 py-2">Loading documents…</p>;
  if (docs.length === 0) return <p className="text-xs text-slate-400 py-2">No documents uploaded yet.</p>;

  return (
    <div className="grid gap-1.5">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-legalGold" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-navy-900">{doc.filename}</p>
            <p className="text-xs text-slate-400">{doc.size_kb} KB</p>
          </div>
          <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-aidGreen" title="Verified upload" />
        </div>
      ))}
    </div>
  );
}

// ── eCourts-style Case Detail Panel ──────────────────────────────────────────
function CaseDetailPanel({ caseData, docRefresh, setDocRefresh }) {
  const curStep = stepIndex(caseData.status);
  const now = new Date();

  // Derive mock hearing/party data from real case fields
  const petitioner = caseData.grievance_text?.split(' ').slice(0, 2).join(' ') || 'Petitioner';
  const nextHearing = new Date(caseData.created_at);
  nextHearing.setDate(nextHearing.getDate() + (caseData.estimated_duration_days || 30));

  const hearingHistory = [
    { date: new Date(caseData.created_at).toLocaleDateString('en-IN'), purpose: 'Filing & Registration', result: 'Admitted' },
    ...(curStep >= 1 ? [{ date: new Date(new Date(caseData.created_at).getTime() + 7 * 86400000).toLocaleDateString('en-IN'), purpose: 'Scrutiny of Documents', result: 'Under Process' }] : []),
    ...(curStep >= 2 ? [{ date: new Date(new Date(caseData.created_at).getTime() + 14 * 86400000).toLocaleDateString('en-IN'), purpose: 'First Hearing', result: 'Notice Issued' }] : []),
    ...(curStep >= 3 ? [{ date: nextHearing.toLocaleDateString('en-IN'), purpose: 'Final Hearing', result: 'Disposed' }] : []),
  ];

  return (
    <div className="grid gap-4">

      {/* ── Case Header Card ── */}
      <div className="rounded border border-slate-200 bg-white overflow-hidden">
        {/* Coloured top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-navy-800 via-legalGold to-aidGreen" />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-legalGold">Case Number</p>
              <p className="mt-1 font-mono text-2xl font-black tracking-widest text-navy-900">{caseData.case_number}</p>
              {caseData.court_type && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <Gavel className="h-3.5 w-3.5 text-legalGold" />
                  {caseData.court_type}
                </p>
              )}
            </div>
            <span className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
              caseData.status === 'resolved'     ? 'bg-emerald-100 text-aidGreen' :
              caseData.status === 'routed'       ? 'bg-blue-100 text-blue-700'   :
              caseData.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {caseData.status?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Info grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-400">Filing Date</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">{new Date(caseData.created_at).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Next Hearing</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">
                {caseData.status === 'resolved' ? 'Case Closed' : nextHearing.toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Est. Duration</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900">{caseData.estimated_duration_days || '—'} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column row: Parties + Status Pipeline ── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Parties */}
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <User className="h-4 w-4 text-legalGold" /> Party Details
          </p>
          <div className="mt-3 grid gap-3">
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-legalGold">Petitioner</p>
              <p className="mt-0.5 text-sm font-bold text-navy-900">{petitioner}</p>
              <p className="text-xs text-slate-400">Through: Self / Legal Aid</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Respondent</p>
              <p className="mt-0.5 text-sm font-bold text-navy-900">State of Karnataka</p>
              <p className="text-xs text-slate-400">Represented by: Government Pleader</p>
            </div>
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <Scale className="h-4 w-4 text-legalGold" /> Case Stage
          </p>
          <div className="mt-3 grid gap-3">
            {STATUS_STEPS.map((step, idx) => {
              const done   = curStep > idx;
              const active = curStep === idx;
              const Icon   = step.icon;
              return (
                <div key={step.key} className={`flex items-center gap-3 rounded p-2.5 text-sm transition-colors ${
                  done   ? 'bg-emerald-50' :
                  active ? 'bg-amber-50 ring-1 ring-legalGold/40' :
                  'bg-slate-50 opacity-50'
                }`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done   ? 'bg-aidGreen text-white' :
                    active ? 'bg-legalGold text-navy-900' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {done ? '✓' : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${done ? 'text-aidGreen' : active ? 'text-navy-900' : 'text-slate-400'}`}>{step.label}</p>
                    {active && <p className="text-xs text-legalGold font-medium">← Current Stage</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Hearing History ── */}
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <Calendar className="h-4 w-4 text-legalGold" /> Hearing History
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2">Result / Order</th>
              </tr>
            </thead>
            <tbody>
              {hearingHistory.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs text-navy-900 whitespace-nowrap">{row.date}</td>
                  <td className="py-2 pr-4 text-xs text-slate-700">{row.purpose}</td>
                  <td className="py-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{row.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Document Upload + List ── */}
      <div className="rounded border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-navy-900 mb-3">
          <FileText className="h-4 w-4 text-legalGold" /> Case Documents
        </p>
        <DocumentList caseId={caseData.case_number} refreshTrigger={docRefresh} />
        <div className="mt-4 border-t border-slate-100 pt-4">
          <DocumentUploader caseId={caseData.case_number} onUploadSuccess={() => setDocRefresh((n) => n + 1)} />
        </div>
      </div>

    </div>
  );
}

// ── Main CaseTracker Page ─────────────────────────────────────────────────────
export default function CaseTracker() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('case_no');
  const [searchValue, setSearchValue] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [district, setDistrict] = useState('');
  const [docRefresh, setDocRefresh] = useState(0);

  const userId = (() => {
    try {
      const token = localStorage.getItem('smartNyayaToken');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1])).sub;
    } catch (_) { return null; }
  })();

  const currentTab = SEARCH_TABS.find((t) => t.id === activeTab);

  const lookup = async (e) => {
    e.preventDefault();
    const val = searchValue.trim();
    if (!val) return;
    setLoading(true);
    setError('');
    setCaseData(null);
    try {
      // For case_no and cnr tabs, search directly by case number
      // For other tabs, also try case number search (backend supports it)
      setCaseData(await legalApi.trackCase(val));
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-14 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-navy-800">
                <Gavel className="h-5 w-5 text-legalGold" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-legalGold">Karnataka eCourts</p>
                <h1 className="font-serif text-2xl font-black text-navy-900">Case Status & Tracker</h1>
              </div>
            </div>
            <p className="mt-1.5 max-w-xl text-sm text-slate-500">
              Search and track case status. Powered by Smart Karnataka Nyaya — integrated with district & taluk court records.
            </p>
          </div>
          <NotificationPanel userId={userId} />
        </div>

        {/* ── Search Card ── */}
        <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
            {SEARCH_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchValue(''); setCaseData(null); setError(''); }}
                className={`flex shrink-0 items-center gap-1.5 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-legalGold bg-white text-navy-900'
                    : 'border-transparent text-slate-500 hover:text-navy-900 hover:bg-white'
                }`}
                type="button"
              >
                {activeTab === tab.id && <ChevronRight className="h-3 w-3 text-legalGold" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={lookup} className="p-5">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {currentTab?.label}
                </label>
                <input
                  className="w-full rounded border border-slate-300 px-4 py-3 font-mono text-sm text-navy-900 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 tracking-wider"
                  placeholder={currentTab?.placeholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  autoComplete="off"
                />
                {activeTab === 'case_no' && (
                  <p className="mt-1 text-xs text-slate-400">Format: CC/NNNNN/YYYY — as printed on your acknowledgement slip</p>
                )}
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Select District
                    </label>
                    <select
                      className="w-full rounded border border-slate-300 px-4 py-3 text-sm text-navy-900 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 bg-white"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    >
                      <option value="">Select District</option>
                      {Object.keys(karnatakaDistricts).sort().map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
              </div>
              <button
                className="mt-6 flex items-center gap-2 self-start rounded bg-navy-800 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-navy-700 transition-colors"
                disabled={loading || !searchValue.trim()}
                type="submit"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Searching…</>
                  : <><Search className="h-4 w-4" />Search</>
                }
              </button>
            </div>

            {/* Error & External Fallback */}
            {error && (
              <div className="mt-6 rounded border border-slate-200 bg-slate-50 p-4 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-navy-900">Case not found in Smart Nyaya Registry</p>
                <p className="mt-1 max-w-lg mx-auto text-xs text-slate-500">
                  We could not find this case in our internal records. If this is a physical court case, please search directly on the official eCourts India portal.
                </p>
                <a
                  href="https://services.ecourts.gov.in/ecourtindia_v6/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded border border-legalGold px-4 py-2 text-xs font-bold text-legalGold hover:bg-legalGold hover:text-navy-900 transition-colors"
                >
                  Search on Official eCourts Portal ↗
                </a>
              </div>
            )}
          </form>
        </div>

        {/* ── Empty state ── */}
        {!caseData && !loading && !error && (
          <div className="mt-6 rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Scale className="mx-auto h-10 w-10 text-slate-200" />
            <p className="mt-3 text-sm font-semibold text-slate-400">Enter your case number to view full case details, hearing history, and upload supporting documents.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              {['Case Number (CC/NNNNN/YYYY)', 'FIR Number'].map((hint) => (
                <span key={hint} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{hint}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Case Detail Panel ── */}
        {caseData && (
          <div className="mt-6">
            <CaseDetailPanel
              caseData={caseData}
              docRefresh={docRefresh}
              setDocRefresh={setDocRefresh}
            />
          </div>
        )}

      </div>
    </section>
  );
}
