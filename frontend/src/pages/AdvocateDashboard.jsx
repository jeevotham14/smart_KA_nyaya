import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Inbox,
  Radio,
  FileText,
  User,
  ArrowRight,
  Loader2,
  RefreshCw,
  Video,
  MapPin,
  XCircle,
  Clock3,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { dashboardApi, consultationApi, getApiError } from '../services/api.js';

export default function AdvocateDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardApi.getAdvocateDashboard();
      if (!res.has_profile) {
        navigate('/advocate/onboarding');
        return;
      }
      setData(res);
    } catch (err) {
      setError(getApiError(err) || (isKn ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to load advocate dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusAction = async (appointmentId, action) => {
    setActionLoading(`${appointmentId}-${action}`);
    try {
      await consultationApi.updateStatus(appointmentId, action);
      await fetchDashboard();
    } catch (err) {
      alert(getApiError(err) || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <Loader2 className="animate-spin text-legalGold h-12 w-12" />
        <span className="ml-3 text-slate-500 font-semibold">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading Advocate Portal...'}</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">{error}</h2>
          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-xl bg-legalGold px-5 py-2.5 text-xs font-bold text-navy-950 hover:bg-yellow-500 transition-all shadow"
          >
            {isKn ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const directRequests = data?.action_required?.direct_requests || [];
  const broadcastMatches = data?.action_required?.broadcast_matches || [];
  const rescheduleRequests = data?.action_required?.reschedule_requests || [];
  const totalActionRequired = directRequests.length + broadcastMatches.length + rescheduleRequests.length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-3 py-1 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> {isKn ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'VERIFIED'}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-3 py-1 text-xs font-bold">
            <Clock3 className="h-3.5 w-3.5" /> {isKn ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ' : 'PENDING VERIFICATION'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 px-3 py-1 text-xs font-bold">
            <ShieldAlert className="h-3.5 w-3.5" /> {isKn ? 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'REJECTED'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── TOP SECTION: Advocate Header & Profile Status ── */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-legalGold">
                {isKn ? 'ಅಧಿಕೃತ ವಕೀಲರ ಕಾರ್ಯಕ್ಷೇತ್ರ' : 'Advocate Workspace'}
              </span>
              {getStatusBadge(data?.profile_status)}
            </div>
            <h1 className="text-3xl font-serif font-black text-navy-900 dark:text-white">
              {isKn ? `ಸ್ವಾಗತ, ಅಡ್ವೋಕೇಟ್ ${data?.name}` : `Welcome, Advocate ${data?.name}`}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {data?.bar_council_number && `${data.bar_council_number} • `}
              {data?.district || 'Karnataka'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-legalGold hover:text-legalGold transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {isKn ? 'ತಾಜಾಗೊಳಿಸಿ' : 'Refresh'}
            </button>
            <Link
              to="/consultations"
              className="rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-legalGold dark:hover:bg-yellow-500 text-white dark:text-navy-950 px-5 py-2.5 text-xs font-bold shadow-md transition-all"
            >
              {isKn ? 'ಎಲ್ಲಾ ಸಮಾಲೋಚನೆಗಳು' : 'All Consultations'}
            </Link>
          </div>
        </div>

        {/* ── PRIORITY NOTIFICATION BANNER (TASK 11B) ── */}
        {directRequests.length > 0 && (
          <div
            id="priority-notification-banner"
            className="rounded-2xl border-2 border-legalGold/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 text-navy-900 dark:text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-legalGold/20 text-legalGold flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {isKn
                    ? `🔔 ನಿಮಗೆ ${directRequests.length} ಹೊಸ ಸಮಾಲೋಚನೆ ಕೋರಿಕೆಗಳಿವೆ`
                    : `🔔 You have ${directRequests.length} new consultation request${directRequests.length > 1 ? 's' : ''}`}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isKn
                    ? 'ನಾಗರಿಕರು ನಿಮ್ಮ ನೇರ ಸಮಾಲೋಚನೆಗಾಗಿ ಕಾಯುತ್ತಿದ್ದಾರೆ. ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಿ.'
                    : 'Citizens have requested your legal consultation. Review and confirm time slots.'}
                </p>
              </div>
            </div>

            <a
              href="#action-required-section"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-legalGold px-4 py-2 text-xs font-black text-navy-950 hover:bg-yellow-500 shadow-sm transition-all"
            >
              <span>{isKn ? 'ಕೋರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Review Requests'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* ── PROMINENT OPERATIONAL CARDS (TASK 10) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ಹೊಸ ಕೋರಿಕೆಗಳು' : 'New Requests'}</p>
            <p className="mt-2 text-3xl font-mono font-black text-amber-600 dark:text-amber-400">{data?.new_direct_requests || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ಬಾಕಿ ಉಳಿದಿದೆ' : 'Pending review'}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Confirmed'}</p>
            <p className="mt-2 text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400">{data?.confirmed_consultations || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು' : 'Active clients'}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ಪ್ರಸಾರ ಹೊಂದಾಣಿಕೆ' : 'Broadcasts'}</p>
            <p className="mt-2 text-3xl font-mono font-black text-blue-600 dark:text-blue-400">{data?.broadcast_matches || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ಹೊಸ ಹೊಂದಾಣಿಕೆಗಳು' : 'Matching cases'}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ಮರುಹೊಂದಾಣಿಕೆ' : 'Reschedule'}</p>
            <p className="mt-2 text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400">{data?.reschedule_requests || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ವೇಳಾಪಟ್ಟಿ ಬದಲಾವಣೆ' : 'Time change'}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ಇಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್' : "Today's Appts"}</p>
            <p className="mt-2 text-3xl font-mono font-black text-purple-600 dark:text-purple-400">{data?.todays_appointments || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ಇಂದು ನಿಗದಿಯಾಗಿದೆ' : 'Scheduled today'}</span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm glass-panel">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{isKn ? 'ಅಧಿಸೂಚನೆಗಳು' : 'Notifications'}</p>
            <p className="mt-2 text-3xl font-mono font-black text-red-600 dark:text-red-400">{data?.unread_notifications || 0}</p>
            <span className="mt-1 block text-[11px] text-slate-400">{isKn ? 'ಓದದಿರುವ ಸಂದೇಶಗಳು' : 'Unread alerts'}</span>
          </div>
        </div>

        {/* ── ACTION REQUIRED SECTION (TASK 20) ── */}
        <div id="action-required-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-xl font-display font-black uppercase tracking-wider text-navy-900 dark:text-white">
                {isKn ? 'ತುರ್ತು ಗಮನ ಅಗತ್ಯ (ACTION REQUIRED)' : 'Action Required'}
              </h2>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2.5 py-0.5 text-xs font-extrabold">
                {totalActionRequired}
              </span>
            </div>

            <Link
              to="/consultations"
              className="text-xs font-bold text-legalGold hover:underline"
            >
              {isKn ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ →' : 'Review All →'}
            </Link>
          </div>

          {totalActionRequired === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 text-center glass-panel">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy-900 dark:text-white">
                {isKn ? 'ಯಾವುದೇ ಬಾಕಿ ಕ್ರಮಗಳಿಲ್ಲ!' : 'All clear! No urgent actions required.'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isKn ? 'ಹೊಸ ಕೋರಿಕೆಗಳು ಬಂದ ತಕ್ಷಣ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.' : 'Incoming direct requests and broadcast matches will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Direct Requests */}
              {directRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/20 dark:bg-navy-900 p-5 shadow-sm glass-panel flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2 py-0.5 font-bold uppercase">
                        {isKn ? 'ನೇರ ಕೋರಿಕೆ' : 'Direct Request'}
                      </span>
                      <span className="font-mono font-bold text-legalGold">₹{req.fee}</span>
                    </div>

                    <p className="text-sm font-bold text-navy-900 dark:text-white">{req.citizen_name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <strong>{req.legal_category}</strong> • {req.consultation_mode}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-legalGold" />
                      {req.appointment_date} at {req.start_time}
                    </p>
                    {req.case_summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 italic bg-white/40 dark:bg-navy-950/40 p-2 rounded-xl">
                        "{req.case_summary}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => handleStatusAction(req.id, 'accept')}
                      disabled={actionLoading === `${req.id}-accept`}
                      className="flex-1 rounded-xl bg-aidGreen hover:bg-emerald-600 text-white py-2 text-xs font-bold transition-all shadow disabled:opacity-50"
                    >
                      {actionLoading === `${req.id}-accept` ? '...' : (isKn ? 'ಸ್ವೀಕರಿಸಿ' : 'Accept')}
                    </button>
                    <button
                      onClick={() => handleStatusAction(req.id, 'reject')}
                      disabled={actionLoading === `${req.id}-reject`}
                      className="rounded-xl border border-red-200 dark:border-red-800 text-alertRed px-3 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-50"
                    >
                      {actionLoading === `${req.id}-reject` ? '...' : (isKn ? 'ತಿರಸ್ಕರಿಸಿ' : 'Decline')}
                    </button>
                    <Link
                      to={`/consultations/${req.id}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all"
                    >
                      {isKn ? 'ವಿವರ' : 'Details'}
                    </Link>
                  </div>
                </div>
              ))}

              {/* Broadcast Matches */}
              {broadcastMatches.map((bc) => (
                <div
                  key={bc.id}
                  className="rounded-2xl border border-blue-300/60 dark:border-blue-500/30 bg-blue-50/20 dark:bg-navy-900 p-5 shadow-sm glass-panel flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="rounded bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400 px-2 py-0.5 font-bold uppercase flex items-center gap-1">
                        <Radio className="h-3 w-3" /> {isKn ? 'ಪ್ರಸಾರ ಹೊಂದಾಣಿಕೆ' : 'Broadcast Match'}
                      </span>
                      <span className="text-[11px] text-slate-400">{bc.district}</span>
                    </div>

                    <p className="text-sm font-bold text-navy-900 dark:text-white">{bc.legal_category}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Mode: <strong>{bc.consultation_mode}</strong> • Date: <strong>{bc.preferred_date}</strong>
                    </p>
                    {bc.short_summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 bg-white/40 dark:bg-navy-950/40 p-2 rounded-xl">
                        "{bc.short_summary}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to="/consultation-broadcasts"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 text-xs font-bold transition-all shadow"
                    >
                      <span>{isKn ? 'ಆಸಕ್ತಿ ವ್ಯಕ್ತಪಡಿಸಿ' : 'Express Interest'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── TODAY'S & UPCOMING CONSULTATIONS (TASK 21) ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Today's Consultations */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-legalGold" />
                {isKn ? 'ಇಂದಿನ ಸಮಾಲೋಚನೆಗಳು' : "Today's Consultations"}
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {(data?.todays_consultations || []).length} {isKn ? 'ನಿಗದಿಯಾಗಿದೆ' : 'scheduled'}
              </span>
            </div>

            {(data?.todays_consultations || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {isKn ? 'ಇಂದು ಯಾವುದೇ ಸಮಾಲೋಚನೆಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ.' : 'No consultations scheduled for today.'}
              </p>
            ) : (
              <div className="space-y-3">
                {data.todays_consultations.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-navy-950/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{app.citizen_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.legal_category} • {app.start_time} - {app.end_time} ({app.consultation_mode})
                      </p>
                    </div>
                    <Link
                      to={`/consultations/${app.id}`}
                      className="rounded-xl bg-legalGold px-3 py-1.5 text-xs font-bold text-navy-950 hover:bg-yellow-500 transition-all"
                    >
                      {isKn ? 'ಪ್ರವೇಶಿಸಿ' : 'Open'}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Consultations */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-legalGold" />
                {isKn ? 'ಮುಂಬರುವ ಸಮಾಲೋಚನೆಗಳು' : 'Upcoming Consultations'}
              </h3>
              <Link to="/consultations" className="text-xs text-legalGold hover:underline font-bold">
                {isKn ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' : 'View All'}
              </Link>
            </div>

            {(data?.upcoming_consultations || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                {isKn ? 'ಯಾವುದೇ ಮುಂಬರುವ ಸಮಾಲೋಚನೆಗಳಿಲ್ಲ.' : 'No upcoming confirmed consultations.'}
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcoming_consultations.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-navy-950/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{app.citizen_name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {app.legal_category} • {app.appointment_date} ({app.start_time})
                      </p>
                    </div>
                    <Link
                      to={`/consultations/${app.id}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-legalGold hover:text-legalGold transition-all"
                    >
                      {isKn ? 'ವೀಕ್ಷಿಸಿ' : 'View'}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
