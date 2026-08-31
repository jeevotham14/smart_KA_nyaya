import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Calendar, CheckCircle, Clock, Download,
  FileCheck, FileText, Lock, Shield, Trash2, Upload, User, Video, XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { consultationApi, getApiError } from '../services/api.js';

export default function ConsultationDetails() {
  const { appointmentId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';

  const [appointment, setAppointment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('LEGAL_NOTICE');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Status update state for advocate
  const [statusUpdating, setStatusUpdating] = useState(false);

  const DOCUMENT_TYPES = [
    { value: 'LEGAL_NOTICE', label: 'Legal Notice' },
    { value: 'FIR', label: 'First Information Report (FIR)' },
    { value: 'COURT_ORDER', label: 'Court Order / Judgment' },
    { value: 'AGREEMENT', label: 'Agreement / Contract' },
    { value: 'PROPERTY_DOCUMENT', label: 'Property / Land Record (Khata/Sale Deed)' },
    { value: 'IDENTITY_DOCUMENT', label: 'Identity Document' },
    { value: 'EVIDENCE', label: 'Evidence / Photograph' },
    { value: 'APPLICATION', label: 'Application / Petition' },
    { value: 'RECEIPT', label: 'Payment / Fee Receipt' },
    { value: 'OTHER', label: 'Other Document' },
  ];

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const app = await consultationApi.getAppointment(appointmentId);
      setAppointment(app);

      // Only load documents if status allows it
      if (app.status === 'CONFIRMED' || app.status === 'COMPLETED') {
        const docs = await consultationApi.listDocuments(appointmentId);
        setDocuments(docs);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, extraPayload = {}) => {
    try {
      setStatusUpdating(true);
      await consultationApi.updateAppointmentStatus(appointmentId, {
        status: newStatus,
        ...extraPayload,
      });
      setActionSuccess(`Consultation status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);
      if (description) formData.append('description', description);

      await consultationApi.uploadDocument(appointmentId, formData);
      setActionSuccess('Document uploaded securely!');
      setSelectedFile(null);
      setDescription('');
      setShowUploadModal(false);
      await loadData();
    } catch (err) {
      setUploadError(getApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await consultationApi.downloadDocument(appointmentId, doc.id, doc.filename);
    } catch (err) {
      alert(`Download failed: ${getApiError(err)}`);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this uploaded document?')) return;
    try {
      await consultationApi.deleteDocument(appointmentId, docId);
      setActionSuccess('Document removed.');
      await loadData();
    } catch (err) {
      alert(`Delete failed: ${getApiError(err)}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-legalGold border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading consultation workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-md mx-auto text-center bg-white dark:bg-navy-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="mt-4 font-bold text-lg text-navy-900 dark:text-white">Unable to Access Consultation</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error || 'Consultation record not found'}</p>
          <Link
            to="/consult-advocate"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 dark:bg-legalGold dark:text-navy-900 text-white px-4 py-2 text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Consultations
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'CONFIRMED';
  const isCompleted = appointment.status === 'COMPLETED';
  const isPending = appointment.status === 'PENDING';
  const isRejectedOrCancelled = appointment.status === 'REJECTED' || appointment.status === 'CANCELLED';
  const allowsDocuments = isConfirmed || isCompleted;

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/consult-advocate"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-legalGold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isKn ? 'ಸಮಾಲೋಚನೆಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Consultations'}
          </Link>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-700 dark:text-green-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{actionSuccess}</p>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-green-700 hover:text-green-900">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Consultation Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    isConfirmed
                      ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                      : isPending
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : isCompleted
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : 'bg-red-500/10 text-red-600 border border-red-500/20'
                  }`}
                >
                  {appointment.status}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Ref ID: {appointment.id.substring(0, 8)}
                </span>
              </div>
              <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                {appointment.legal_category} Consultation
              </h1>
            </div>

            {/* Advocate Action Buttons (Accept / Reject / Reschedule) */}
            {isPending && (
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange('CONFIRMED', { scheduled_date_time: appointment.preferred_date_time })}
                  className="rounded-xl bg-green-600 text-white px-4 py-2 text-xs font-bold hover:bg-green-700 transition-all"
                >
                  Accept Consultation
                </button>
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange('REJECTED')}
                  className="rounded-xl bg-red-600/10 text-red-600 border border-red-600/20 px-3 py-2 text-xs font-bold hover:bg-red-600/20 transition-all"
                >
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Consultation Meta Grid */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Assigned Advocate</p>
              <p className="mt-1 font-bold text-sm text-navy-900 dark:text-white">{appointment.advocate_name || 'Advocate'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">District & Language</p>
              <p className="mt-1 font-bold text-sm text-navy-900 dark:text-white">{appointment.district} • {appointment.language}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Mode</p>
              <p className="mt-1 font-bold text-sm text-navy-900 dark:text-white capitalize">{appointment.consultation_mode}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Appointment Time</p>
              <p className="mt-1 font-bold text-sm text-legalGold">{appointment.scheduled_date_time || appointment.preferred_date_time}</p>
            </div>
          </div>

          {/* Case Summary */}
          <div className="mt-6 rounded-xl bg-slate-50 dark:bg-navy-800 p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Case Summary</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{appointment.case_summary}</p>
          </div>
        </div>

        {/* SECURE DOCUMENTS WORKSPACE (Tasks 2, 7, 8, 9, 10, 12, 13) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-legalGold/10 flex items-center justify-center text-legalGold">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">
                  {isKn ? 'ಖಾಸಗಿ ದಾಖಲೆಗಳ ಹಂಚಿಕೆ' : 'Private Consultation Documents'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKn ? 'ವಕೀಲರಿಗೆ ಮಾತ್ರ ಲಭ್ಯವಿರುವ ಸುರಕ್ಷಿತ ದಾಖಲೆಗಳು' : 'Accessible strictly by you and your assigned advocate'}
                </p>
              </div>
            </div>

            {/* Upload Button: Render ONLY if appointment is CONFIRMED or COMPLETED */}
            {allowsDocuments && (
              <button
                id="upload-doc-btn"
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-legalGold px-4 py-2.5 text-sm font-bold text-navy-900 hover:bg-yellow-500 transition-all shadow-sm"
              >
                <Upload className="h-4 w-4" />
                {isKn ? 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Document'}
              </button>
            )}
          </div>

          {/* Privacy Access Policy Notice (Tasks 2, 13, 16) */}
          {!allowsDocuments && (
            <div className="my-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-start gap-4">
              <Lock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  {isKn ? 'ದಾಖಲೆ ಹಂಚಿಕೆ ಲಾಕ್ ಆಗಿದೆ' : 'Document Sharing Is Protected'}
                </h4>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {isKn
                    ? 'ವಕೀಲರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ದೃಢೀಕರಿಸುವವರೆಗೆ (CONFIRMED) ಗೌಪ್ಯ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ. ವಕೀಲರು ವಿನಂತಿಯನ್ನು ಒಪ್ಪಿಕೊಂಡ ನಂತರ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.'
                    : 'To protect your private legal evidence, documents can only be uploaded and viewed once this consultation is CONFIRMED by the advocate. Uploading to pending, rejected, or cancelled consultations is strictly disallowed.'}
                </p>
              </div>
            </div>
          )}

          {/* Uploaded Documents List (Task 8) */}
          {allowsDocuments && (
            <div className="mt-6">
              {documents.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileCheck className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-navy-900 dark:text-white">
                    {isKn ? 'ಯಾವುದೇ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಂಡಿಲ್ಲ' : 'No documents shared yet'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {isKn
                      ? 'ನಿಮ್ಮ ವಕೀಲರ ಪರಿಶೀಲನೆಗಾಗಿ ಸಂಬಂಧಿತ ಲೀಗಲ್ ನೋಟಿಸ್, ಎಫ್‌ಐಆರ್ ಅಥವಾ ಆದೇಶಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
                      : 'Upload supporting legal notices, FIR copies, or court orders to share with your assigned advocate.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3" id="documents-list">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800/60 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-navy-100 dark:bg-navy-700 flex items-center justify-center text-legalGold shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-navy-900 dark:text-white truncate">
                            {doc.filename}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="rounded bg-legalGold/10 px-1.5 py-0.5 text-legalGold font-semibold text-[10px]">
                              {doc.document_type}
                            </span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            {doc.description && (
                              <span className="italic text-slate-400">"{doc.description}"</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 dark:bg-navy-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-legalGold hover:text-navy-900 transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          View / Download
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* UPLOAD MODAL (Task 13) */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                  {isKn ? 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Legal Document'}
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Privacy Warning Notice (Task 13) */}
              <div className="my-4 rounded-xl bg-navy-50 dark:bg-navy-800/80 border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-600 dark:text-slate-300">
                <Shield className="h-4 w-4 text-legalGold inline-block mr-1.5" />
                <strong>Privacy Notice:</strong> "Only upload documents relevant to this consultation. Avoid unnecessary Aadhaar numbers, bank details, passwords, or unrelated personal information."
              </div>

              {/* Stronger Identity Document Warning (Task 11) */}
              {documentType === 'IDENTITY_DOCUMENT' && (
                <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/30 p-3 text-xs text-orange-700 dark:text-orange-300">
                  <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                  <strong>Important:</strong> Aadhaar upload is NEVER mandatory. If uploading identity proof, ensure financial and biometric numbers are redacted.
                </div>
              )}

              {uploadError && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-700 dark:text-red-300">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Choose File (PDF, JPG, JPEG, PNG, DOCX - max 10MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-100 dark:file:bg-navy-800 file:text-navy-900 dark:file:text-legalGold hover:file:bg-navy-200 cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>{dt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Legal notice copy served on July 10"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-xl bg-legalGold px-5 py-2 text-sm font-bold text-navy-900 hover:bg-yellow-500 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
