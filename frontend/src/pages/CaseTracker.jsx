import { useEffect, useRef, useState } from 'react';
import {
  Bell, BellOff, CheckCheck, FileText, Loader2,
  Paperclip, Search, ShieldCheck, Upload, X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { getApiError, legalApi, notificationApi } from '../services/api.js';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'submitted',    label: 'Request Submitted' },
  { key: 'under_review', label: 'Documents Received & Under Review' },
  { key: 'routed',       label: 'Routed to Competent Authority' },
  { key: 'resolved',     label: 'Case Resolved / Closed' },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Notification panel ────────────────────────────────────────────────────────
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
      const data = await notificationApi.fetchForUser(userId);
      setNotifications(data);
    } catch (_) {
      // silently fail if user is not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markOne = async (id) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => n.notification_id === id ? { ...n, read_status: true } : n));
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
        className="relative flex items-center gap-2 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:border-legalGold transition-colors"
        type="button"
        aria-label="Notifications"
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
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 transition-colors ${!n.read_status ? 'bg-navy-50' : ''}`}
                  type="button"
                >
                  <div className="flex items-start gap-2">
                    {!n.read_status && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-legalGold" />}
                    <div className={!n.read_status ? '' : 'pl-4'}>
                      <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-600">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(n.created_at).toLocaleString('en-IN')}
                      </p>
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
      setUploadError(`File too large. Max ${MAX_MB} MB allowed.`);
      return;
    }
    setFile(selected);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) { fileInputRef.current.files = e.dataTransfer.files; handleFile({ target: { files: e.dataTransfer.files } }); }
  };

  const upload = async () => {
    if (!file || !caseId) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const result = await legalApi.uploadCaseDocument(caseId, file);
      setUploadSuccess(`✅ "${result.filename}" uploaded successfully (${result.size_kb} KB). Total documents: ${result.total_documents}`);
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
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-legalGold" />
        <p className="font-bold text-navy-900">Upload Supporting Document</p>
      </div>
      <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG, DOCX — max {MAX_MB} MB</p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center hover:border-legalGold hover:bg-slate-100 transition-colors"
      >
        <Upload className="h-6 w-6 text-slate-400" />
        {file ? (
          <p className="mt-2 text-sm font-semibold text-navy-900">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Click or drag & drop a file here</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {uploadError && <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{uploadError}</p>}
      {uploadSuccess && <p className="mt-3 rounded-sm bg-green-50 p-3 text-sm font-semibold text-green-700">{uploadSuccess}</p>}

      <button
        onClick={upload}
        disabled={!file || uploading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-navy-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-navy-700 transition-colors"
        type="button"
      >
        {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Upload Document</>}
      </button>
    </div>
  );
}

// ── Uploaded documents list ───────────────────────────────────────────────────
function DocumentList({ caseId, refreshTrigger }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!caseId) return;
    setLoading(true);
    try { setDocs(await legalApi.listCaseDocuments(caseId)); }
    catch (_) { setDocs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [caseId, refreshTrigger]);

  if (loading) return <p className="text-sm text-slate-500">Loading documents…</p>;
  if (docs.length === 0) return <p className="text-sm text-slate-500">No documents uploaded yet.</p>;

  return (
    <div className="grid gap-2">
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-legalGold" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{doc.filename}</p>
            <p className="text-xs text-slate-500">{doc.content_type} · {doc.size_kb} KB</p>
          </div>
          <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-green-500" title="Verified upload" />
        </div>
      ))}
    </div>
  );
}

// ── Main CaseTracker page ─────────────────────────────────────────────────────
export default function CaseTracker() {
  const [trackingId, setTrackingId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docRefresh, setDocRefresh] = useState(0);
  const { t } = useTranslation();

  // Get logged-in user from localStorage JWT (decode payload)
  const userId = (() => {
    try {
      const token = localStorage.getItem('smartNyayaToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (_) { return null; }
  })();

  const lookup = async (event) => {
    event.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');
    setCaseData(null);
    try {
      setCaseData(await legalApi.trackCase(trackingId.trim()));
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const currentStep = caseData ? stepIndex(caseData.status) : -1;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header row with Notifications bell */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader eyebrow={t('caseTracker.eyebrow')} title={t('caseTracker.title')}>
            {t('caseTracker.desc')}
          </SectionHeader>
          <div className="shrink-0 pt-2">
            <NotificationPanel userId={userId} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">

          {/* ── Left: Search + case info ───────────────────────────────── */}
          <div className="grid gap-4 content-start">
            <form className="rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={lookup}>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('caseTracker.caseId')}</span>
                <input
                  className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
                  placeholder={t('caseTracker.placeholder')}
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </label>
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60 hover:bg-navy-700 transition-colors"
                disabled={loading}
                type="submit"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{t('caseTracker.checking')}</>
                  : <><Search className="h-4 w-4" />{t('caseTracker.checkStatus')}</>}
              </button>
              {error && <p className="mt-4 rounded-sm bg-red-50 p-4 text-sm font-semibold text-alertRed">{error}</p>}

              {caseData && (
                <div className="mt-4 rounded-sm border border-aidGreen/30 bg-green-50 p-4 text-sm leading-6">
                  <p className="font-bold text-navy-900">Case Found ✅</p>
                  <p className="mt-1 text-slate-700"><span className="font-semibold">Status:</span> <span className="capitalize">{caseData.status?.replace(/_/g, ' ')}</span></p>
                  <p className="text-slate-700"><span className="font-semibold">Case ID:</span> <span className="font-mono text-xs">{caseData.case_id}</span></p>
                  {caseData.court_type && <p className="text-slate-700"><span className="font-semibold">Court:</span> {caseData.court_type}</p>}
                  {caseData.estimated_duration_days && <p className="text-slate-700"><span className="font-semibold">Est. Duration:</span> {caseData.estimated_duration_days} days</p>}
                </div>
              )}
            </form>

            {/* Document upload (only shown when a case is found) */}
            {caseData && (
              <DocumentUploader
                caseId={caseData.case_id}
                onUploadSuccess={() => setDocRefresh((n) => n + 1)}
              />
            )}
          </div>

          {/* ── Right: Timeline + documents list ──────────────────────── */}
          <div className="grid gap-6 content-start">

            {/* Status Timeline */}
            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-navy-900">{t('caseTracker.statusTimeline')}</h3>
              <div className="mt-5 grid gap-5">
                {STATUS_STEPS.map((step, index) => {
                  const done = currentStep >= index;
                  const active = currentStep === index;
                  return (
                    <div className="relative flex gap-4" key={step.key}>
                      {/* Vertical line */}
                      {index < STATUS_STEPS.length - 1 && (
                        <span className={`absolute left-3 top-6 h-full w-0.5 ${done ? 'bg-aidGreen' : 'bg-slate-200'}`} />
                      )}
                      <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        done ? 'border-aidGreen bg-aidGreen text-white' :
                        active ? 'border-legalGold bg-legalGold/10 text-legalGold' :
                        'border-slate-300 bg-white text-slate-400'
                      }`}>
                        {done ? '✓' : index + 1}
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${done ? 'text-navy-900' : 'text-slate-500'}`}>{step.label}</p>
                        {active && <p className="text-xs text-legalGold font-medium">← Current stage</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Uploaded Documents list */}
            {caseData && (
              <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-legalGold" />
                  <h3 className="font-bold text-navy-900">Uploaded Documents</h3>
                </div>
                <DocumentList caseId={caseData.case_id} refreshTrigger={docRefresh} />
              </section>
            )}

            {!caseData && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <Search className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Enter a Case ID above to track your case and upload documents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
