import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Calendar, FileText, Gavel, Loader2, MapPin,
  Paperclip, Scale, ShieldCheck, Upload, User, CheckCircle2, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiError, legalApi } from '../services/api.js';
import CaseTimeline from './CaseTimeline.jsx';

export const STATUS_STEPS = [
  { key: 'submitted',    label: 'Filed / Registered', labelKn: 'ದಾಖಲಿಸಲಾಗಿದೆ / ನೋಂದಾಯಿಸಲಾಗಿದೆ' },
  { key: 'under_review', label: 'Under Scrutiny',     labelKn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ' },
  { key: 'routed',       label: 'Listed for Hearing', labelKn: 'ವಿಚಾರಣೆಗೆ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ' },
  { key: 'resolved',     label: 'Disposed / Closed',  labelKn: 'ತೀರ್ಮಾನಿಸಲಾಗಿದೆ / ಮುಕ್ತಾಯಗೊಂಡಿದೆ' },
];

export function stepIndex(status) {
  if (!status) return 0;
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const DISTRICT_NAMES_KN = {
  'Bengaluru Urban': 'ಬೆಂಗಳೂರು ನಗರ',
  'Bengaluru Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  'Mysuru': 'ಮೈಸೂರು',
  'Dharwad': 'ಧಾರವಾಡ',
  'Kalaburagi': 'ಕಲಬುರಗಿ',
  'Belagavi': 'ಬೆಳಗಾವಿ',
  'Dakshina Kannada': 'ದಕ್ಷಿಣ ಕನ್ನಡ',
  'Shivamogga': 'ಶಿವಮೊಗ್ಗ',
  'Tumakuru': 'ತುಮಕೂರು',
  'Udupi': 'ಉಡುಪಿ',
  'Ballari': 'ಬಳ್ಳಾರಿ',
  'Bidar': 'ಬೀದರ್',
  'Hassan': 'ಹಾಸನ',
};

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';

function DocumentList({ caseId, refreshTrigger, externalDocs }) {
  const { i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(externalDocs) && externalDocs.length > 0) {
      setDocs(externalDocs);
      return;
    }
    if (!caseId) return;
    setLoading(true);
    legalApi.listCaseDocuments(caseId)
      .then((res) => setDocs(Array.isArray(res) ? res : []))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [caseId, refreshTrigger, externalDocs]);

  if (loading) return <p className="text-xs text-slate-400 py-2">{isKn ? 'ದಾಖಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…' : 'Loading documents…'}</p>;
  if (docs.length === 0) return <p className="text-xs text-slate-400 py-2">{isKn ? 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳು ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ.' : 'No documents uploaded yet.'}</p>;

  return (
    <div className="grid gap-1.5">
      {docs.map((doc, i) => (
        <div key={doc.id || i} className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-legalGold" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-navy-900 dark:text-white">{doc.filename || doc.name || 'Document'}</p>
            <p className="text-xs text-slate-400">{doc.size_kb ? `${doc.size_kb} KB` : (doc.uploaded_at || 'Uploaded')}</p>
          </div>
          <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-aidGreen" title="Verified upload" />
        </div>
      ))}
    </div>
  );
}

function UploadForm({ caseId, onUploadSuccess }) {
  const { i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setUploadError(isKn ? 'ಗರಿಷ್ಠ ಫೈಲ್ ಗಾತ್ರ 5MB.' : 'Maximum file size is 5MB.');
      return;
    }
    setFile(f);
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

export default function CaseDetailPanel({
  caseData,
  loading = false,
  error = null,
  docRefresh = 0,
  setDocRefresh,
  onRetry
}) {
  const { i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  // ── STATE 1: LOADING ──
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 text-center shadow-sm glass-panel">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-legalGold" />
        <p className="mt-3 text-sm font-semibold text-slate-500">
          {isKn ? 'ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Loading case details...'}
        </p>
      </div>
    );
  }

  // ── STATE 2: ERROR ──
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto h-8 w-8 text-alertRed" />
        <p className="mt-2 text-base font-bold text-alertRed">
          {isKn ? 'ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.' : 'Unable to load case details.'}
        </p>
        {typeof error === 'string' && <p className="mt-1 text-xs text-slate-500">{error}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800 transition-colors"
          >
            {isKn ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry'}
          </button>
        )}
      </div>
    );
  }

  // ── STATE 3: NO CASE SELECTED ──
  if (!caseData) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 text-center shadow-sm glass-panel">
        <Scale className="mx-auto h-10 w-10 text-legalGold" />
        <p className="mt-3 text-base font-bold text-navy-900 dark:text-white">
          {isKn ? 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಪ್ರಕರಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Select a case to view details.'}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {isKn
            ? 'ಪ್ರಕರಣದ ಸ್ಥಿತಿ ಮತ್ತು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಪ್ರಕರಣ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
            : 'Enter a case number or FIR number above to view its detailed status.'}
        </p>
      </div>
    );
  }

  // ── STATE 4: VALID CASE DATA (Guarded Rendering) ──
  const status = caseData.status || 'submitted';
  const curStep = stepIndex(status);
  const caseNumber = caseData.case_number || 'N/A';
  const courtType = caseData.court_type || null;
  const districtName = caseData.district || 'Bengaluru Urban';
  const districtDisplay = isKn && DISTRICT_NAMES_KN[districtName] ? DISTRICT_NAMES_KN[districtName] : districtName;

  const grievanceText = typeof caseData.grievance_text === 'string' ? caseData.grievance_text : '';
  const petitioner = grievanceText.split(' ').slice(0, 2).join(' ') || (isKn ? 'ಅರ್ಜಿದಾರರು' : 'Petitioner');

  const safeDateParse = (dateVal) => {
    if (!dateVal) return new Date();
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const formatDate = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    try {
      return dateObj.toLocaleDateString(isKn ? 'kn-IN' : 'en-IN');
    } catch {
      return 'N/A';
    }
  };

  const createdDate = safeDateParse(caseData.created_at);
  const nextHearing = new Date(createdDate.getTime());
  nextHearing.setDate(nextHearing.getDate() + (Number(caseData.estimated_duration_days) || 30));

  const hearingHistory = [
    { date: formatDate(createdDate), purpose: isKn ? 'ದಾಖಲಾತಿ ಮತ್ತು ನೋಂದಣಿ' : 'Filing & Registration', result: isKn ? 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' : 'Admitted' },
    ...(curStep >= 1 ? [{ date: formatDate(new Date(createdDate.getTime() + 7 * 86400000)), purpose: isKn ? 'ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ' : 'Scrutiny of Documents', result: isKn ? 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'Under Process' }] : []),
    ...(curStep >= 2 ? [{ date: formatDate(new Date(createdDate.getTime() + 14 * 86400000)), purpose: isKn ? 'ಮೊದಲ ವಿಚಾರಣೆ' : 'First Hearing', result: isKn ? 'ನೋಟೀಸ್ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ' : 'Notice Issued' }] : []),
    ...(curStep >= 3 ? [{ date: formatDate(nextHearing), purpose: isKn ? 'ಅಂತಿಮ ತೀರ್ಮಾನ' : 'Final Hearing', result: isKn ? 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ' : 'Disposed' }] : []),
  ];

  // Guaranteed safe array access
  const documents = Array.isArray(caseData.documents) ? caseData.documents : [];
  const notes = Array.isArray(caseData.notes) ? caseData.notes : [];
  const timeline = Array.isArray(caseData.timeline) ? caseData.timeline : [];
  const tasks = Array.isArray(caseData.tasks) ? caseData.tasks : [];

  return (
    <div className="grid gap-4">
      {/* ── Case Header Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 overflow-hidden shadow-sm glass-panel">
        <div className="h-1.5 w-full bg-gradient-to-r from-navy-800 via-legalGold to-aidGreen" />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-legalGold">
                  {isKn ? 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ' : 'Case Number'}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-legalGold/10 dark:bg-legalGold/20 px-2.5 py-0.5 text-xs font-bold text-legalGold">
                  <MapPin className="h-3 w-3" /> {districtDisplay}
                </span>
              </div>
              <p className="mt-1 font-mono text-2xl font-black tracking-widest text-navy-900 dark:text-white">
                {caseNumber}
              </p>
              {courtType && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                  <Gavel className="h-3.5 w-3.5 text-legalGold" />
                  {courtType}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                status === 'resolved'     ? 'bg-emerald-100 text-aidGreen' :
                status === 'routed'       ? 'bg-blue-100 text-blue-700'   :
                status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {isKn
                  ? (STATUS_STEPS.find((s) => s.key === status)?.labelKn || status)
                  : status.replace(/_/g, ' ')}
              </span>
              <Link
                to={`/workspace/${encodeURIComponent(caseNumber)}`}
                className="text-xs font-bold text-legalGold hover:text-navy-900 dark:hover:text-white hover:underline transition-colors"
              >
                {isKn ? 'ಸಂಪೂರ್ಣ ಡಿಜಿಟಲ್ ವರ್ಕ್‌ಸ್ಪೇಸ್ ವೀಕ್ಷಿಸಿ →' : 'View Full Workspace →'}
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">{isKn ? 'ಜಿಲ್ಲೆ (District)' : 'District'}</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900 dark:text-white">{districtDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{isKn ? 'ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ' : 'Filing Date'}</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900 dark:text-white">{formatDate(createdDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{isKn ? 'ಮುಂದಿನ ವಿಚಾರಣೆ' : 'Next Hearing'}</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900 dark:text-white">
                {status === 'resolved' ? (isKn ? 'ಪ್ರಕರಣ ಮುಕ್ತಾಯಗೊಂಡಿದೆ' : 'Case Closed') : formatDate(nextHearing)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{isKn ? 'ಅಂದಾಜು ಅವಧಿ' : 'Est. Duration'}</p>
              <p className="mt-0.5 text-sm font-semibold text-navy-900 dark:text-white">
                {caseData.estimated_duration_days || '—'} {isKn ? 'ದಿನಗಳು' : 'days'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Parties and Timeline ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
          <p className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
            <User className="h-4 w-4 text-legalGold" /> {isKn ? 'ಪಕ್ಷಗಳ ವಿವರಗಳು (Parties)' : 'Party Details'}
          </p>
          <div className="mt-3 grid gap-3">
            <div className="rounded bg-slate-50 dark:bg-navy-950 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-legalGold">
                {isKn ? 'ಅರ್ಜಿದಾರರು / ಫಿರ್ಯಾದಿ' : 'Petitioner'}
              </p>
              <p className="mt-0.5 text-sm font-bold text-navy-900 dark:text-white">{petitioner}</p>
              <p className="text-xs text-slate-400">
                {isKn ? 'ಮೂಲಕ: ಸ್ವತಃ / ಉಚಿತ ಕಾನೂನು ನೆರವು' : 'Through: Self / Legal Aid'}
              </p>
            </div>
            <div className="rounded bg-slate-50 dark:bg-navy-950 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {isKn ? 'ಎದುರು ಪಕ್ಷ / ಪ್ರತಿವಾದಿ' : 'Respondent'}
              </p>
              <p className="mt-0.5 text-sm font-bold text-navy-900 dark:text-white">
                {isKn ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ' : 'State of Karnataka'}
              </p>
              <p className="text-xs text-slate-400">
                {isKn ? 'ಪ್ರತಿನಿಧಿ: ಸರ್ಕಾರಿ ಅಭಿಯೋಜಕರು / ವಕೀಲರು' : 'Represented by: Government Pleader'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel h-full">
          <p className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
            <Scale className="h-4 w-4 text-legalGold" /> {isKn ? 'ಪ್ರಕರಣದ ಹಂತಗಳ ಟೈಮ್‌ಲೈನ್' : 'Detailed Case Timeline'}
          </p>
          <div className="mt-4">
            <CaseTimeline caseId={caseNumber} currentStatus={status} />
          </div>
        </div>
      </div>

      {/* ── Hearing History ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
        <p className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
          <Calendar className="h-4 w-4 text-legalGold" /> {isKn ? 'ವಿಚಾರಣೆ ಇತಿಹಾಸ (Hearing History)' : 'Hearing History'}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-2 pr-4">{isKn ? 'ದಿನಾಂಕ' : 'Date'}</th>
                <th className="pb-2 pr-4">{isKn ? 'ಉದ್ದೇಶ / ವಿಷಯ' : 'Purpose'}</th>
                <th className="pb-2">{isKn ? 'ಫಲಿತಾಂಶ / ಆದೇಶ' : 'Result / Order'}</th>
              </tr>
            </thead>
            <tbody>
              {hearingHistory.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs text-navy-900 dark:text-white whitespace-nowrap">{row.date}</td>
                  <td className="py-2 pr-4 text-xs text-slate-700 dark:text-slate-300">{row.purpose}</td>
                  <td className="py-2">
                    <span className="rounded bg-slate-100 dark:bg-navy-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{row.result}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Optional Tasks and Notes if provided ── */}
      {tasks.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
          <p className="text-sm font-bold text-navy-900 dark:text-white mb-3">Tasks</p>
          <div className="grid gap-2">
            {tasks.map((task, i) => (
              <div key={task.id || i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-aidGreen" />
                <span className="text-slate-800 dark:text-slate-200">{task.title || task.description || 'Task'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
          <p className="text-sm font-bold text-navy-900 dark:text-white mb-3">Case Notes</p>
          <div className="grid gap-2">
            {notes.map((note, i) => (
              <div key={note.id || i} className="rounded bg-slate-50 dark:bg-navy-950 p-3 text-xs">
                <p className="text-slate-700 dark:text-slate-300">{note.content || note.text}</p>
                {note.created_at && <span className="text-[10px] text-slate-400">{note.created_at}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Documents & Upload ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
          <p className="text-sm font-bold text-navy-900 dark:text-white mb-3">
            {isKn ? 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಪ್ರಕರಣದ ದಾಖಲೆಗಳು' : 'Uploaded Case Documents'}
          </p>
          <DocumentList caseId={caseNumber} refreshTrigger={docRefresh} externalDocs={documents} />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
          <UploadForm caseId={caseNumber} onUploadSuccess={() => setDocRefresh && setDocRefresh((r) => r + 1)} />
        </div>
      </div>
    </div>
  );
}
