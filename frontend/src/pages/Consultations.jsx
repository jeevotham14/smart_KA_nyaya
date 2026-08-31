import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { consultationApi, authApi, getApiError } from '../services/api.js';
import { isAdvocate as checkIsAdvocate } from '../utils/roleUtils.js';
import { Calendar, Clock, Video, Building2, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

export default function Consultations() {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleData, setRescheduleData] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [userData, apptData] = await Promise.all([
        authApi.me(),
        consultationApi.getMyConsultations()
      ]);
      setUser(userData);
      setAppointments(apptData || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) return;
    try {
      await consultationApi.updateStatus(id, action);
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleAdvocateReschedule = async (id) => {
    const data = rescheduleData[id];
    if (!data?.new_date || !data?.new_start_time || !data?.new_end_time) {
      alert('Please fill date, start time, and end time');
      return;
    }
    try {
      await consultationApi.rescheduleAppointment(id, data);
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleAcceptReschedule = async (id) => {
    if (!window.confirm('Accept the new proposed time?')) return;
    try {
      await consultationApi.acceptReschedule(id);
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  const handleDeclineReschedule = async (id) => {
    if (!window.confirm('Decline the new time and cancel the appointment?')) return;
    try {
      await consultationApi.declineReschedule(id);
      fetchData();
    } catch (err) {
      alert(getApiError(err));
    }
  };

  // Use roleUtils to correctly handle both 'advocate' and 'lawyer_advisor'
  const isAdvocate = checkIsAdvocate(user?.role);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-legalGold" /></div>;

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white mb-8">
          My Consultations
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 flex gap-3 text-sm text-red-700 border border-red-200">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Unable to load consultations. {error}</p>
          </div>
        )}

        {!error && appointments.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">No consultation appointments yet.</p>
            {!isAdvocate && (
              <Link to="/advocates" className="mt-4 inline-block text-sm text-legalGold hover:underline">Browse Advocates →</Link>
            )}
          </div>
        )}

        {!error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map(app => (
              <div key={app.id} className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'RESCHEDULE_REQUESTED' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-sm font-medium text-slate-500">{app.legal_category}</span>
                    {isAdvocate && app.citizen_name && (
                      <span className="text-xs text-slate-400">Citizen: <strong>{app.citizen_name}</strong></span>
                    )}
                    {!isAdvocate && app.advocate_name && (
                      <span className="text-xs text-slate-400">Advocate: <strong>{app.advocate_name}</strong></span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300 mb-4">
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {app.appointment_date}</p>
                    <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {app.start_time} - {app.end_time}</p>
                    <p className="flex items-center gap-2">
                      {app.consultation_mode === 'ONLINE' ? <Video className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      {app.consultation_mode}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Case Summary</p>
                    {app.case_summary}
                  </div>

                  {app.status === 'CONFIRMED' && app.meeting_details && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-100 dark:border-blue-900/50">
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Meeting Details</p>
                      {app.meeting_details}
                    </div>
                  )}

                  {/* Reschedule proposal UI */}
                  {app.status === 'RESCHEDULE_REQUESTED' && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Advocate proposed a new consultation time:</p>
                      <ul className="text-sm text-purple-700 dark:text-purple-400 mb-2 list-disc pl-5">
                        <li>Date: {app.proposed_date}</li>
                        <li>Time: {app.proposed_start_time} - {app.proposed_end_time}</li>
                      </ul>
                      {app.advocate_message && (
                        <p className="text-sm italic text-purple-600 dark:text-purple-500 mb-3">"{app.advocate_message}"</p>
                      )}
                      {!isAdvocate && (
                        <div className="flex gap-3">
                          <button onClick={() => handleAcceptReschedule(app.id)} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Accept New Time</button>
                          <button onClick={() => handleDeclineReschedule(app.id)} className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded text-sm hover:bg-purple-100">Cancel Request</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advocate reschedule proposal form */}
                  {isAdvocate && app.status === 'CONFIRMED' && (
                    <div className="mt-4 p-4 bg-slate-50 border rounded-lg">
                      <p className="font-semibold mb-2 text-sm">Propose New Time</p>
                      <div className="flex gap-2 mb-2">
                        <input type="date" className="border rounded px-2 py-1 text-sm" onChange={e => setRescheduleData({...rescheduleData, [app.id]: {...rescheduleData[app.id], new_date: e.target.value}})} />
                        <input type="time" className="border rounded px-2 py-1 text-sm" onChange={e => setRescheduleData({...rescheduleData, [app.id]: {...rescheduleData[app.id], new_start_time: e.target.value}})} />
                        <input type="time" className="border rounded px-2 py-1 text-sm" onChange={e => setRescheduleData({...rescheduleData, [app.id]: {...rescheduleData[app.id], new_end_time: e.target.value}})} />
                      </div>
                      <input type="text" placeholder="Message (optional)" className="border rounded px-2 py-1 text-sm w-full mb-2" onChange={e => setRescheduleData({...rescheduleData, [app.id]: {...rescheduleData[app.id], message: e.target.value}})} />
                      <button onClick={() => handleAdvocateReschedule(app.id)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm">Propose New Time</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-[150px] shrink-0 justify-start items-end">
                  <div className="font-bold text-lg mb-2">₹{app.consultation_fee}</div>

                  {/* Open Consultation link for CONFIRMED/COMPLETED */}
                  {(app.status === 'CONFIRMED' || app.status === 'COMPLETED') && (
                    <Link
                      to={`/consultations/${app.id}`}
                      className="w-full px-4 py-2 bg-navy-900 text-white hover:bg-navy-800 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Consultation
                    </Link>
                  )}

                  {isAdvocate ? (
                    <>
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusChange(app.id, 'accept')} className="w-full px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors">Accept</button>
                          <button onClick={() => handleStatusChange(app.id, 'reject')} className="w-full px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Reject</button>
                        </>
                      )}
                      {app.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusChange(app.id, 'complete')} className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">Mark Completed</button>
                      )}
                    </>
                  ) : (
                    <>
                      {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                        <button onClick={() => handleStatusChange(app.id, 'cancel')} className="w-full px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}