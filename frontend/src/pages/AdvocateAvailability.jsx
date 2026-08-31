import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Plus, Trash2, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { advocateApi, getApiError } from '../services/api.js';

const DAYS_OF_WEEK = [
 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function AdvocateAvailability() {
 const { t, i18n } = useTranslation();
 const isKn = i18n.language === 'kn';

 const [profile, setProfile] = useState(null);
 const [slots, setSlots] = useState([]);
 const [loading, setLoading] = useState(true);
 const [adding, setAdding] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const [newSlot, setNewSlot] = useState({
 day_of_week: 'Monday',
 start_time: '10:00',
 end_time: '12:00',
 slot_duration: 30
 });

 const fetchData = async () => {
 try {
 setLoading(true);
 setError('');
 const prof = await advocateApi.getMyProfile();
 setProfile(prof);
 if (prof?.id) {
 const avail = await advocateApi.getAvailability(prof.id);
 setSlots(Array.isArray(avail) ? avail : []);
 }
 } catch (err) {
 setError(getApiError(err) || 'Failed to load availability');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, []);

 const handleAddSlot = async (e) => {
 e.preventDefault();
 if (!profile?.id) return;
 setAdding(true);
 setError('');
 setSuccess('');

 try {
 await advocateApi.createAvailability({
 advocate_id: profile.id,
 day_of_week: newSlot.day_of_week,
 start_time: newSlot.start_time,
 end_time: newSlot.end_time,
 slot_duration: Number(newSlot.slot_duration)
 });
 setSuccess(isKn ? 'ಲಭ್ಯತೆಯ ಸ್ಲಾಟ್ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!' : 'Availability slot added successfully!');
 await fetchData();
 } catch (err) {
 setError(getApiError(err) || 'Failed to create slot');
 } finally {
 setAdding(false);
 }
 };

 const handleDeleteSlot = async (slotId) => {
 if (!window.confirm(isKn ? 'ಈ ಸ್ಲಾಟ್ ಅಳಿಸಲು ಖಚಿತವೇ?' : 'Are you sure you want to remove this availability slot?')) return;
 try {
 await advocateApi.deleteAvailability(slotId);
 setSuccess(isKn ? 'ಸ್ಲಾಟ್ ಅಳಿಸಲಾಗಿದೆ' : 'Slot removed successfully');
 setSlots(prev => prev.filter(s => s.id !== slotId));
 } catch (err) {
 setError(getApiError(err) || 'Failed to delete slot');
 }
 };

 if (loading && !profile) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
 <Loader2 className="animate-spin text-legalGold h-10 w-10" />
 <span className="ml-3 text-slate-500 font-semibold">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading availability...'}</span>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-10 px-4 sm:px-6 lg:px-8">
 <div className="max-w-4xl mx-auto space-y-6">
 
 {/* Top Header */}
 <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <span className="text-xs uppercase font-extrabold tracking-widest text-legalGold">
 {isKn ? 'ವೇಳಾಪಟ್ಟಿ ನಿರ್ವಹಣೆ' : 'Schedule Management'}
 </span>
 <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-900 dark:text-white mt-1">
 {isKn ? 'ಸಮಾಲೋಚನೆ ಲಭ್ಯತೆ' : 'Consultation Availability'}
 </h1>
 <p className="text-xs text-slate-500 mt-1">
 {isKn ? 'ನಾಗರಿಕರು ನಿಮ್ಮನ್ನು ಕಾಯ್ದಿರಿಸಲು ಲಭ್ಯವಿರುವ ದಿನಗಳು ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್‌ಗಳನ್ನು ಹೊಂದಿಸಿ.' : 'Set your recurring available hours for direct citizen bookings.'}
 </p>
 </div>
 </div>

 {error && (
 <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-xs sm:text-sm font-semibold text-alertRed dark:text-red-400 flex items-center gap-2">
 <AlertCircle className="h-5 w-5 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {success && (
 <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
 <CheckCircle className="h-5 w-5 shrink-0" />
 <span>{success}</span>
 </div>
 )}

 {/* Add New Slot Form */}
 <form onSubmit={handleAddSlot} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm space-y-4">
 <h2 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
 <Plus className="h-4 w-4 text-legalGold" />
 {isKn ? 'ಹೊಸ ಲಭ್ಯತೆಯ ಸ್ಲಾಟ್ ಸೇರಿಸಿ' : 'Add Availability Slot'}
 </h2>

 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
 Day
 </label>
 <select
 value={newSlot.day_of_week}
 onChange={(e) => setNewSlot(prev => ({ ...prev, day_of_week: e.target.value }))}
 className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 text-xs focus:border-legalGold outline-none"
 >
 {DAYS_OF_WEEK.map(d => (
 <option key={d} value={d}>{d}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
 Start Time
 </label>
 <input
 type="time"
 value={newSlot.start_time}
 onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
 required
 className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 text-xs focus:border-legalGold outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
 End Time
 </label>
 <input
 type="time"
 value={newSlot.end_time}
 onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
 required
 className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-3 py-2 text-xs focus:border-legalGold outline-none"
 />
 </div>

 <div>
 <button
 type="submit"
 disabled={adding}
 className="w-full rounded-xl bg-legalGold hover:bg-yellow-500 text-navy-950 font-bold py-2.5 text-xs shadow transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
 >
 {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
 <span>{adding ? 'Adding...' : 'Add Slot'}</span>
 </button>
 </div>
 </div>
 </form>

 {/* Existing Slots List */}
 <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm space-y-4">
 <h2 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
 <Clock className="h-4 w-4 text-legalGold" />
 {isKn ? 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಲಭ್ಯತೆಯ ಸ್ಲಾಟ್‌ಗಳು' : 'Your Configured Slots'}
 <span className="text-xs font-normal text-slate-400">({slots.length})</span>
 </h2>

 {slots.length === 0 ? (
 <p className="text-xs text-slate-400 py-6 text-center">
 {isKn ? 'ಯಾವುದೇ ಸ್ಲಾಟ್‌ಗಳು ಹೊಂದಿಸಲಾಗಿಲ್ಲ. ಹೊಸ ಸ್ಲಾಟ್ ಸೇರಿಸಿ.' : 'No availability slots configured yet. Add one above.'}
 </p>
 ) : (
 <div className="grid gap-3 sm:grid-cols-2">
 {slots.map(slot => (
 <div
 key={slot.id}
 className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-navy-950/50 flex items-center justify-between gap-4"
 >
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-xl bg-legalGold/10 text-legalGold flex items-center justify-center shrink-0">
 <Calendar className="h-4 w-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-navy-900 dark:text-white">{slot.day_of_week}</p>
 <p className="text-[11px] text-slate-500 font-mono">
 {slot.start_time} - {slot.end_time} ({slot.slot_duration || 30} min)
 </p>
 </div>
 </div>

 <button
 onClick={() => handleDeleteSlot(slot.id)}
 className="p-2 rounded-xl text-slate-400 hover:text-alertRed hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
 title="Delete Slot"
 type="button"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
