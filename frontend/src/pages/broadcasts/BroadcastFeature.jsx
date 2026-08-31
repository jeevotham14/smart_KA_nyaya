import React, { useState, useEffect } from 'react';
import { consultationApi, getApiError } from '../../services/api.js';
import { isAdvocate as checkIsAdvocate } from '../../utils/roleUtils.js';
import {
  Scale, MapPin, Calendar, Clock, Globe, AlertTriangle,
  CheckCircle2, Loader2, Send, X, User, ChevronDown
} from 'lucide-react';

const LEGAL_CATEGORIES = [
  'Civil Law', 'Criminal Law', 'Family Law', 'Property Law',
  'Labour Law', 'Consumer Law', 'Corporate Law', 'Constitutional Law',
  'Cyber Law', 'Matrimonial Law', 'Other'
];

const LANGUAGES = ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu', 'Urdu'];
const DISTRICTS = [
  'Bangalore Urban', 'Mysuru', 'Belagavi', 'Kalburgi', 'Mangaluru',
  'Hubli-Dharwad', 'Shivamogga', 'Tumakuru', 'Bellary', 'Vijayapura',
  'Raichur', 'Hassan', 'Udupi', 'Bidar', 'Chitradurga', 'Other'
];

// ── Privacy Warning ───────────────────────────────────────────────────────────
const PrivacyWarning = () => (
  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
    <p className="text-sm text-amber-800">
      <strong>Privacy Notice:</strong> Do not include Aadhaar numbers, bank details,
      passwords, exact account numbers, or unnecessary sensitive information.
      Supporting legal documents can be shared privately after the consultation is confirmed.
    </p>
  </div>
);

// ── Request Advocate Matches (Citizen) ────────────────────────────────────────
export const RequestAdvocateMatches = ({ onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    legal_category: '',
    district: '',
    preferred_language: 'Kannada',
    consultation_mode: 'ONLINE',
    preferred_date: '',
    preferred_time: '',
    pro_bono_requested: false,
    short_summary: '',
  });

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!formData.legal_category || !formData.district || !formData.short_summary.trim()) {
      setError('Please fill in Legal Category, District, and Case Summary.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await consultationApi.createBroadcast(formData);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-bold text-slate-800">Request Sent!</h3>
        <p className="text-sm text-slate-500">
          Matching advocates have been notified. You will receive a notification when an advocate responds.
        </p>
        <button
          onClick={() => { setSuccess(false); setFormData({ legal_category: '', district: '', preferred_language: 'Kannada', consultation_mode: 'ONLINE', preferred_date: '', preferred_time: '', pro_bono_requested: false, short_summary: '' }); }}
          className="mt-2 text-sm text-legalGold hover:underline"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Request Advocate Matches</h2>
      <p className="text-sm text-slate-500 mb-4">
        Describe your issue and matching advocates in your district will be notified.
      </p>
      <PrivacyWarning />

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Legal Category *</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              value={formData.legal_category} onChange={set('legal_category')} required
            >
              <option value="">Select category...</option>
              {LEGAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
              value={formData.district} onChange={set('district')} required
            >
              <option value="">Select district...</option>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Language</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" value={formData.preferred_language} onChange={set('preferred_language')}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Mode</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" value={formData.consultation_mode} onChange={set('consultation_mode')}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">In-Person</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
            <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.preferred_date} onChange={set('preferred_date')} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time</label>
            <input type="time" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={formData.preferred_time} onChange={set('preferred_time')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Short Case Summary *</label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[100px] resize-none"
            placeholder="Briefly describe your legal issue. Do not include sensitive personal identifiers."
            value={formData.short_summary} onChange={set('short_summary')} required maxLength={800}
          />
          <p className="text-xs text-slate-400 mt-1">{formData.short_summary.length}/800 characters</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
          <input type="checkbox" checked={formData.pro_bono_requested} onChange={set('pro_bono_requested')} className="rounded" />
          I am requesting pro-bono (free) legal assistance
        </label>

        <button
          type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 disabled:opacity-60 transition-colors"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Sending...' : 'Send Broadcast Request'}
        </button>
      </form>
    </div>
  );
};

// ── My Broadcast Requests (Citizen) ──────────────────────────────────────────
export const MyBroadcastRequests = ({ refreshTrigger }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [responses, setResponses] = useState({});
  const [loadingResponses, setLoadingResponses] = useState({});

  useEffect(() => {
    setLoading(true);
    consultationApi.listBroadcasts()
      .then(data => setBroadcasts(data || []))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const loadResponses = async (broadcastId) => {
    if (responses[broadcastId]) { setExpandedId(broadcastId); return; }
    setLoadingResponses(prev => ({ ...prev, [broadcastId]: true }));
    try {
      const data = await consultationApi.getBroadcastResponses(broadcastId);
      setResponses(prev => ({ ...prev, [broadcastId]: data || [] }));
      setExpandedId(broadcastId);
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setLoadingResponses(prev => ({ ...prev, [broadcastId]: false }));
    }
  };

  const handleSelect = async (broadcastId, advocateId) => {
    if (!window.confirm('Select this advocate for your consultation?')) return;
    try {
      await consultationApi.selectBroadcastAdvocate(broadcastId, advocateId);
      alert('Advocate selected! A consultation request has been created.');
      setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'MATCHED' } : b));
    } catch (err) { alert(getApiError(err)); }
  };

  const handleCancel = async (broadcastId) => {
    if (!window.confirm('Cancel this broadcast request?')) return;
    try {
      await consultationApi.cancelBroadcast(broadcastId);
      setBroadcasts(prev => prev.map(b => b.id === broadcastId ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) { alert(getApiError(err)); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-legalGold" /></div>;
  if (error) return <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>;
  if (broadcasts.length === 0) return <p className="text-sm text-slate-500 py-4 text-center">No broadcast requests yet.</p>;

  const statusColor = (s) => ({
    OPEN: 'bg-emerald-100 text-emerald-700',
    MATCHED: 'bg-blue-100 text-blue-700',
    EXPIRED: 'bg-slate-100 text-slate-500',
    CANCELLED: 'bg-red-100 text-red-600',
  }[s] || 'bg-slate-100 text-slate-600');

  return (
    <div className="space-y-3">
      {broadcasts.map(b => (
        <div key={b.id} className="border border-slate-200 rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
              <span className="ml-2 text-sm font-medium text-slate-800">{b.legal_category}</span>
            </div>
            {b.status === 'OPEN' && (
              <button onClick={() => handleCancel(b.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><X className="h-3 w-3" />Cancel</button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{b.short_summary}</p>
          <div className="flex gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.district}</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{b.preferred_language}</span>
          </div>
          {b.status === 'OPEN' && (
            <button
              onClick={() => expandedId === b.id ? setExpandedId(null) : loadResponses(b.id)}
              className="text-xs text-legalGold hover:underline flex items-center gap-1"
            >
              {loadingResponses[b.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <User className="h-3 w-3" />}
              {expandedId === b.id ? 'Hide Responses' : 'View Interested Advocates'}
            </button>
          )}
          {expandedId === b.id && responses[b.id] !== undefined && (
            <div className="mt-3 space-y-2">
              {responses[b.id].length === 0 ? (
                <p className="text-xs text-slate-400">No advocates have responded yet.</p>
              ) : responses[b.id].map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.advocate_name}</p>
                    <p className="text-xs text-slate-500">{r.district} · {(r.specializations || []).join(', ')}</p>
                    {r.proposed_fee != null && <p className="text-xs text-slate-600">Fee: ₹{r.proposed_fee}</p>}
                  </div>
                  <button
                    onClick={() => handleSelect(b.id, r.advocate_id)}
                    className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Advocate Broadcast Inbox ──────────────────────────────────────────────────
export const AdvocateBroadcastInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState({});

  useEffect(() => {
    consultationApi.getMatchedBroadcasts()
      .then(data => setRequests(data || []))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleInterest = async (req) => {
    setActing(prev => ({ ...prev, [req.id]: 'interested' }));
    try {
      await consultationApi.expressInterest(req.id, {
        consultation_mode: req.consultation_mode,
        advocate_message: '',
      });
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setActing(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  };

  const handleDecline = async (req) => {
    setActing(prev => ({ ...prev, [req.id]: 'declining' }));
    try {
      await consultationApi.declineBroadcast(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
    } catch (err) {
      alert(getApiError(err));
    } finally {
      setActing(prev => { const n = { ...prev }; delete n[req.id]; return n; });
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-legalGold" /></div>;
  if (error) return <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Broadcast Requests</h2>
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Scale className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No matching broadcast requests at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">{req.legal_category}</span>
                {req.preferred_date && (
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" />{req.preferred_date}</span>
                )}
              </div>
              <p className="text-sm text-slate-700 mb-3 line-clamp-3">{req.short_summary}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.district}</span>
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{req.preferred_language}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.consultation_mode}</span>
                {req.pro_bono_requested && <span className="text-emerald-600 font-medium">Pro-Bono Requested</span>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleInterest(req)}
                  disabled={!!acting[req.id]}
                  className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {acting[req.id] === 'interested' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  I'm Interested
                </button>
                <button
                  onClick={() => handleDecline(req)}
                  disabled={!!acting[req.id]}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {acting[req.id] === 'declining' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Role-Aware Navigation (kept for backward compat) ──────────────────────────
export const RoleAwareNavigation = ({ role }) => {
  const isAdv = checkIsAdvocate(role);
  if (isAdv) {
    return <nav><span>Advocate Dashboard</span><span>Broadcast Requests</span><span>Direct Requests</span><span>My Consultations</span></nav>;
  }
  return <nav><span>Consult an Advocate</span><span>Request Advocate Matches</span><span>My Broadcast Requests</span><span>My Consultations</span></nav>;
};
