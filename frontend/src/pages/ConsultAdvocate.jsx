import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle, Clock, FileText, Filter, MessageSquare,
  Radio, Search, Shield, ShieldCheck, UserCheck, Users, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { consultationApi, getApiError } from '../services/api.js';
import { karnatakaDistricts } from '../data/karnatakaDistricts.js';


export default function ConsultAdvocate() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'broadcast' | 'my_consultations'
  const [advocates, setAdvocates] = useState([]);
  const [myConsultations, setMyConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Browse filter state
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Direct Request Modal state
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [requestForm, setRequestForm] = useState({
    legal_category: 'Property',
    case_summary: '',
    district: '',
    language: 'English',
    consultation_mode: 'online',
    preferred_date_time: '',
    pro_bono: false,
  });

  // Broadcast Form state
  const [broadcastForm, setBroadcastForm] = useState({
    legal_category: 'Property',
    case_summary: '',
    district: 'Bengaluru Urban',
    language: 'English',
    consultation_mode: 'online',
    preferred_date_time: '',
    pro_bono: false,
  });

  const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

  const CATEGORIES = [
    'Property', 'Civil', 'Criminal', 'Labour', 'Family', 'Consumer',
    'Women Protection', 'Revenue / Land', 'Cyber / IT', 'Other'
  ];

  useEffect(() => {
    loadAdvocates();
    loadConsultations();
  }, [selectedDistrict, searchKeyword]);

  const loadAdvocates = async () => {
    try {
      setLoading(true);
      const data = await consultationApi.listAdvocates({
        district: selectedDistrict || undefined,
        q: searchKeyword || undefined,
      });
      setAdvocates(data);
    } catch (err) {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  const loadConsultations = async () => {
    try {
      const data = await consultationApi.listAppointments();
      setMyConsultations(data);
    } catch (err) {
      // non-blocking if unauthenticated
    }
  };

  const handleOpenRequestModal = (advocate) => {
    setSelectedAdvocate(advocate);
    setRequestForm((prev) => ({
      ...prev,
      district: advocate.district || 'Bengaluru Urban',
    }));
  };

  const handleCloseRequestModal = () => {
    setSelectedAdvocate(null);
    setError('');
  };

  const handleSubmitDirectRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        ...requestForm,
        advocate_id: selectedAdvocate.user_id,
      };
      const res = await consultationApi.createAppointment(payload);
      setSuccessMsg(isKn ? 'ಸಮಾಲೋಚನೆ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ!' : 'Consultation request sent successfully!');
      handleCloseRequestModal();
      loadConsultations();
      setActiveTab('my_consultations');
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await consultationApi.createBroadcast(broadcastForm);
      setSuccessMsg(isKn ? 'ಗೌಪ್ಯ ಪ್ರಸಾರ ವಿನಂತಿಯನ್ನು ರಚಿಸಲಾಗಿದೆ. ಹೊಂದಾಣಿಕೆಯಾಗುವ ವಕೀಲರನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಸೂಚಿಸಲಾಗುತ್ತದೆ!' : 'Privacy-safe broadcast created. Matching advocates will be notified.');
      setBroadcastForm({
        legal_category: 'Property',
        case_summary: '',
        district: 'Bengaluru Urban',
        language: 'English',
        consultation_mode: 'online',
        preferred_date_time: '',
        pro_bono: false,
      });
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">Smart Karnataka Nyaya</p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white">
            {isKn ? 'ಕಾನೂನು ವೃತ್ತಿಪರರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ' : 'Consult a Legal Professional'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-3xl">
            {isKn
              ? 'ಪರಿಶೀಲಿತ ವಕೀಲರನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ಖಾಸಗಿಯಾಗಿ ಪ್ರಸಾರ ಮಾಡಿ. ವಕೀಲರು ದೃಢೀಕರಿಸಿದ ನಂತರ ಮಾತ್ರ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹಂಚಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.'
              : 'Browse verified advocates or submit a privacy-safe consultation request. Documents are only shared once an appointment is confirmed by your selected advocate.'}
          </p>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-700 dark:text-green-300 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-700 dark:text-red-300 flex items-center gap-3">
            <X className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'browse'
                ? 'border-legalGold text-legalGold font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            {isKn ? 'ವಕೀಲರನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Advocates'}
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'border-legalGold text-legalGold font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Radio className="h-4 w-4" />
            {isKn ? 'ನನ್ನ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ' : 'Describe My Legal Problem'}
          </button>
          <button
            onClick={() => {
              setActiveTab('my_consultations');
              loadConsultations();
            }}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'my_consultations'
                ? 'border-legalGold text-legalGold font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            {isKn ? 'ನನ್ನ ಸಮಾಲೋಚನೆಗಳು' : 'My Consultations'}
            {myConsultations.length > 0 && (
              <span className="ml-1 rounded-full bg-legalGold/20 px-2 py-0.5 text-xs text-legalGold font-bold">
                {myConsultations.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: BROWSE ADVOCATES */}
        {activeTab === 'browse' && (
          <div>
            {/* Filter Bar */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3 bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={isKn ? 'ವಕೀಲರ ಹೆಸರನ್ನು ಹುಡುಕಿ...' : 'Search advocate by name...'}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-sm focus:outline-none focus:border-legalGold dark:text-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 text-sm focus:outline-none focus:border-legalGold dark:text-white"
                >
                  <option value="">{isKn ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು' : 'All Districts'}</option>
                  {DISTRICT_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                <span>{isKn ? 'ಎಲ್ಲಾ ವಕೀಲರು ಕರ್ನಾಟಕ ಬಾರ್ ಕೌನ್ಸಿಲ್ ಪರಿಶೀಲನೆ ಹೊಂದಿದ್ದಾರೆ' : 'All advocates verified by Karnataka State Bar Council'}</span>
              </div>
            </div>

            {/* Advocate Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {advocates.length === 0 ? (
                <div className="col-span-full text-center py-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                  <UserCheck className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 font-bold text-navy-900 dark:text-white">
                    {isKn ? 'ಯಾವುದೇ ವಕೀಲರು ಕಂಡುಬಂದಿಲ್ಲ' : 'No advocates found'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {isKn ? 'ಬೇರೆ ಜಿಲ್ಲೆಯನ್ನು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಸಮಸ್ಯೆ ಪ್ರಸಾರ ಮಾಡಿ.' : 'Try changing your district filter or use the broadcast feature.'}
                  </p>
                </div>
              ) : (
                advocates.map((adv) => (
                  <div
                    key={adv.user_id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="h-12 w-12 rounded-full bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-legalGold font-bold text-lg">
                          {adv.name.charAt(0)}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 border border-green-500/20">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-navy-900 dark:text-white">{adv.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {adv.district || 'Karnataka'} {adv.taluk ? `• ${adv.taluk}` : ''}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 dark:bg-navy-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">
                          {adv.language_pref || 'English, Kannada'}
                        </span>
                        <span className="rounded-md bg-legalGold/10 px-2 py-0.5 text-xs text-legalGold font-medium">
                          High Court & District Court
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenRequestModal(adv)}
                        className="w-full rounded-xl bg-legalGold py-2.5 text-center text-sm font-bold text-navy-900 transition-all hover:bg-yellow-500 shadow-sm"
                      >
                        {isKn ? 'ಸಮಾಲೋಚನೆ ವಿನಂತಿ' : 'Request Consultation'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DESCRIBE MY LEGAL PROBLEM (BROADCAST) */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-900 dark:text-white">
                    {isKn ? 'ಗೌಪ್ಯ-ಸುರಕ್ಷಿತ ಪ್ರಸಾರ' : 'Privacy-Safe Legal Broadcast'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isKn ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ; ಹೊಂದಾಣಿಕೆಯಾಗುವ ವಕೀಲರು ತಮ್ಮ ಆಸಕ್ತಿಯನ್ನು ವ್ಯಕ್ತಪಡಿಸುತ್ತಾರೆ.' : 'Post your issue anonymously; matching advocates express interest.'}
                  </p>
                </div>
              </div>

              {/* Privacy Warning Banner (Task 15) */}
              <div className="mt-4 rounded-xl bg-navy-50 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-600 dark:text-slate-300">
                <Shield className="h-4 w-4 text-legalGold inline-block mr-1.5" />
                <strong>Privacy Guaranteed:</strong> No documents or private phone/Aadhaar numbers are attached to broadcast inquiries. You select one advocate from respondents before any documents can ever be shared.
              </div>
            </div>

            <form onSubmit={handleSubmitBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                  {isKn ? 'ಕಾನೂನು ವರ್ಗ' : 'Legal Category'}
                </label>
                <select
                  value={broadcastForm.legal_category}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, legal_category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                  {isKn ? 'ಜಿಲ್ಲೆ' : 'District'}
                </label>
                <select
                  value={broadcastForm.district}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  required
                >
                  {DISTRICT_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                  {isKn ? 'ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ' : 'Short Case Summary'}
                </label>
                <textarea
                  rows={4}
                  placeholder={isKn ? 'ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸಿ (ಖಾಸಗಿ ಹೆಸರುಗಳನ್ನು ಸೇರಿಸಬೇಡಿ)...' : 'Briefly describe your situation without private Aadhaar or sensitive bank info...'}
                  value={broadcastForm.case_summary}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, case_summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                    {isKn ? 'ಭಾಷೆ' : 'Preferred Language'}
                  </label>
                  <select
                    value={broadcastForm.language}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, language: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  >
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                    {isKn ? 'ಸಮಾಲೋಚನಾ ವಿಧಾನ' : 'Consultation Mode'}
                  </label>
                  <select
                    value={broadcastForm.consultation_mode}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, consultation_mode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  >
                    <option value="online">Online Video Call</option>
                    <option value="in_person">In-Person Meeting</option>
                    <option value="phone">Phone Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1">
                  {isKn ? 'ಆದ್ಯತೆಯ ದಿನಾಂಕ/ಸಮಯ' : 'Preferred Date / Time'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next Tuesday morning (10 AM)"
                  value={broadcastForm.preferred_date_time}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, preferred_date_time: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-3 text-sm focus:border-legalGold dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pro_bono_check"
                  checked={broadcastForm.pro_bono}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, pro_bono: e.target.checked })}
                  className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                />
                <label htmlFor="pro_bono_check" className="text-sm text-slate-700 dark:text-slate-300">
                  {isKn ? 'ಉಚಿತ / ಪ್ರೊ-ಬೋನೋ ಸೇವೆಗೆ ಆದ್ಯತೆ' : 'Prefer Free / Pro-Bono Legal Assistance if eligible'}
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-navy-900 dark:bg-legalGold dark:text-navy-900 text-white font-bold py-3 text-sm hover:opacity-90 transition-all shadow-md mt-4"
              >
                {isKn ? 'ಪ್ರಸಾರ ಸಲ್ಲಿಸಿ' : 'Broadcast Consultation Request'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MY CONSULTATIONS */}
        {activeTab === 'my_consultations' && (
          <div className="space-y-4">
            {myConsultations.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 font-bold text-navy-900 dark:text-white">
                  {isKn ? 'ಯಾವುದೇ ಸಮಾಲೋಚನೆಗಳಿಲ್ಲ' : 'No active consultations found'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isKn ? 'ವಕೀಲರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಸಮಸ್ಯೆಯನ್ನು ಪ್ರಸಾರ ಮಾಡಿ.' : 'Select an advocate from the directory or post a broadcast request.'}
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-legalGold px-4 py-2 text-sm font-bold text-navy-900"
                >
                  {isKn ? 'ವಕೀಲರನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Advocates'}
                </button>
              </div>
            ) : (
              myConsultations.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          app.status === 'CONFIRMED'
                            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                            : app.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : app.status === 'COMPLETED'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : 'bg-red-500/10 text-red-600 border border-red-500/20'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {app.legal_category}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-navy-900 dark:text-white">
                      {app.advocate_name || 'Assigned Advocate'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                      {app.case_summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-legalGold" /> {app.preferred_date_time}
                      </span>
                      <span>Mode: {app.consultation_mode}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      to={`/consultations/${app.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-navy-900 dark:bg-navy-800 border border-slate-700 text-white px-5 py-2.5 text-sm font-semibold hover:border-legalGold hover:text-legalGold transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      {isKn ? 'ವಿವರಗಳು ಮತ್ತು ದಾಖಲೆಗಳು' : 'Details & Documents'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MODAL: DIRECT CONSULTATION REQUEST */}
        {selectedAdvocate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                    {isKn ? 'ಸಮಾಲೋಚನೆ ವಿನಂತಿ ಸಲ್ಲಿಸಿ' : 'Request Consultation'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Advocate: <span className="font-semibold text-legalGold">{selectedAdvocate.name}</span>
                  </p>
                </div>
                <button onClick={handleCloseRequestModal} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Security Banner: No documents at request time */}
              <div className="my-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                <Shield className="h-4 w-4 inline mr-1 text-amber-500" />
                <strong>Privacy Policy:</strong> Do NOT attach documents here. Document sharing unlocks securely inside the consultation workspace once the advocate confirms your appointment.
              </div>

              <form onSubmit={handleSubmitDirectRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Legal Category
                  </label>
                  <select
                    value={requestForm.legal_category}
                    onChange={(e) => setRequestForm({ ...requestForm, legal_category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Case Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly state your query..."
                    value={requestForm.case_summary}
                    onChange={(e) => setRequestForm({ ...requestForm, case_summary: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mode
                    </label>
                    <select
                      value={requestForm.consultation_mode}
                      onChange={(e) => setRequestForm({ ...requestForm, consultation_mode: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                    >
                      <option value="online">Online Video</option>
                      <option value="in_person">In-Person</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Language
                    </label>
                    <select
                      value={requestForm.language}
                      onChange={(e) => setRequestForm({ ...requestForm, language: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                    >
                      <option value="Kannada">Kannada</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Date / Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wednesday 3:00 PM"
                    value={requestForm.preferred_date_time}
                    onChange={(e) => setRequestForm({ ...requestForm, preferred_date_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-800 p-2.5 text-sm dark:text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseRequestModal}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-legalGold px-5 py-2 text-sm font-bold text-navy-900 hover:bg-yellow-500"
                  >
                    Send Request
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
