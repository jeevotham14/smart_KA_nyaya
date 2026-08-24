import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { advocateApi, consultationApi, getApiError } from '../services/api.js';
import { MapPin, Scale, CheckCircle2, Loader2, Calendar, Clock, Video, Building2 } from 'lucide-react';

export default function AdvocateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advocate, setAdvocate] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [caseSummary, setCaseSummary] = useState('');
  const [legalCategory, setLegalCategory] = useState('Civil Law');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const adv = await advocateApi.getAdvocate(id);
        setAdvocate(adv);
        const slots = await advocateApi.getAvailability(id);
        setAvailability(slots || []);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !caseSummary.trim()) return;
    
    setBookingLoading(true);
    try {
      await consultationApi.bookConsultation({
        advocate_id: advocate.id,
        availability_id: selectedSlot.id,
        legal_category: legalCategory,
        case_summary: caseSummary,
        consultation_mode: selectedSlot.consultation_mode,
        appointment_date: selectedSlot.date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        consultation_fee: advocate.consultation_fee
      });
      navigate('/consultations');
    } catch (err) {
      alert(getApiError(err));
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-legalGold" /></div>;
  if (error) return <div className="text-center py-20 text-alertRed">{error}</div>;
  if (!advocate) return <div className="text-center py-20">Advocate not found</div>;

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
            <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white flex items-center gap-3">
              {advocate.full_name}
              {advocate.verification_status === 'VERIFIED' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
            </h1>
            <p className="mt-2 text-slate-500">Bar Council: {advocate.bar_council_number}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="h-5 w-5 text-slate-400" />
                <span>{advocate.district}{advocate.city ? `, ${advocate.city}` : ''}</span>
              </div>
              <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                <Scale className="h-5 w-5 text-slate-400" />
                <span>{advocate.specializations?.join(', ')}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-3">About</h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{advocate.bio || 'No biography provided.'}</p>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-navy-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24">
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Book Consultation</h2>
            
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Available Slots</label>
                {availability.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 dark:bg-navy-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">No slots available</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {availability.map(slot => (
                      <div 
                        key={slot.id} 
                        onClick={() => setSelectedSlot(slot)}
                        className={`cursor-pointer border p-3 rounded-lg flex items-center justify-between text-sm transition-colors ${selectedSlot?.id === slot.id ? 'border-legalGold bg-legalGold/5' : 'border-slate-200 dark:border-slate-700 hover:border-legalGold/50'}`}
                      >
                        <div>
                          <p className="font-semibold">{slot.date}</p>
                          <p className="text-slate-500">{slot.start_time} - {slot.end_time}</p>
                        </div>
                        <div className="text-right">
                          {slot.consultation_mode === 'ONLINE' ? <Video className="h-4 w-4 ml-auto text-sky-500" /> : <Building2 className="h-4 w-4 ml-auto text-emerald-500" />}
                          <span className="text-xs text-slate-400">{slot.consultation_mode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Legal Category</label>
                    <select 
                      className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm"
                      value={legalCategory}
                      onChange={(e) => setLegalCategory(e.target.value)}
                    >
                      <option>Civil Law</option>
                      <option>Criminal Law</option>
                      <option>Family Law</option>
                      <option>Property Law</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Case Summary (Brief)</label>
                    <textarea 
                      className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent text-sm min-h-[100px]"
                      placeholder="Briefly describe your issue..."
                      value={caseSummary}
                      onChange={(e) => setCaseSummary(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between font-bold text-navy-900 dark:text-white mb-4">
                      <span>Consultation Fee</span>
                      <span>₹{advocate.consultation_fee}</span>
                    </div>
                    <button 
                      type="submit" 
                      disabled={bookingLoading}
                      className="premium-btn premium-btn-gold w-full py-3 justify-center"
                    >
                      {bookingLoading ? 'Requesting...' : 'Request Consultation'}
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-3">Payment details will be shared upon confirmation.</p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
