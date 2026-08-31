import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Loader2, AlertCircle, CheckCircle, ShieldCheck, Clock3, ShieldAlert, Save } from 'lucide-react';
import { advocateApi, getApiError } from '../services/api.js';
import { karnatakaDistricts } from '../data/karnatakaDistricts.js';

const SPECIALIZATIONS = [
  'Civil Law', 'Criminal Law', 'Family Law', 'Property Law',
  'Labour Law', 'Consumer Law', 'Cyber Law', 'Corporate Law', 'Tax Law',
  'Constitutional Law', 'Revenue Law', 'Motor Accident Claims', 'Banking Law'
];

const LANGUAGES = ['Kannada', 'English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Urdu'];

export default function AdvocateProfilePage() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';
  const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    bar_council_number: '',
    district: '',
    specializations: [],
    languages: [],
    years_of_experience: 0,
    consultation_fee: 0,
    online_consultation: true,
    offline_consultation: true,
    pro_bono_available: false,
    bio: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await advocateApi.getMyProfile();
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        bar_council_number: data.bar_council_number || '',
        district: data.district || '',
        specializations: data.specializations || [],
        languages: data.languages || [],
        years_of_experience: data.years_of_experience || 0,
        consultation_fee: data.consultation_fee || 0,
        online_consultation: data.online_consultation ?? true,
        offline_consultation: data.offline_consultation ?? true,
        pro_bono_available: data.pro_bono_available ?? false,
        bio: data.bio || ''
      });
    } catch (err) {
      setError(getApiError(err) || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (success) setSuccess('');
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setForm(prev => {
      const current = prev[field] || [];
      if (e.target.checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
    });
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await advocateApi.updateProfile({
        full_name: form.full_name,
        district: form.district,
        specializations: form.specializations,
        languages: form.languages,
        years_of_experience: Number(form.years_of_experience),
        consultation_fee: Number(form.consultation_fee),
        online_consultation: Boolean(form.online_consultation),
        offline_consultation: Boolean(form.offline_consultation),
        pro_bono_available: Boolean(form.pro_bono_available),
        bio: form.bio
      });
      setSuccess(isKn ? 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!' : 'Professional profile updated successfully!');
      await fetchProfile();
    } catch (err) {
      setError(getApiError(err) || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <Loader2 className="animate-spin text-legalGold h-10 w-10" />
        <span className="ml-3 text-slate-500 font-semibold">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading profile...'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-legalGold">
              {isKn ? 'ವೃತ್ತಿಪರ ಮಾಹಿತಿ' : 'Professional Practice'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-navy-900 dark:text-white mt-1">
              {isKn ? 'ವಕೀಲರ ಪ್ರೊಫೈಲ್' : 'Advocate Profile'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.bar_council_number && `${profile.bar_council_number} • `}
              {profile?.district || 'Karnataka'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile?.verification_status === 'VERIFIED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-3.5 py-1.5 text-xs font-bold">
                <ShieldCheck className="h-4 w-4" /> VERIFIED
              </span>
            ) : profile?.verification_status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-3.5 py-1.5 text-xs font-bold">
                <Clock3 className="h-4 w-4" /> PENDING VERIFICATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 px-3.5 py-1.5 text-xs font-bold">
                <ShieldAlert className="h-4 w-4" /> {profile?.verification_status || 'UNVERIFIED'}
              </span>
            )}
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

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-4 py-2.5 text-sm focus:border-legalGold focus:ring-1 focus:ring-legalGold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Bar Council Number (Read-only)
              </label>
              <input
                type="text"
                value={form.bar_council_number}
                disabled
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-navy-950/50 text-slate-500 px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                District
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-4 py-2.5 text-sm focus:border-legalGold focus:ring-1 focus:ring-legalGold outline-none"
              >
                <option value="">Select District</option>
                {DISTRICT_NAMES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_of_experience"
                value={form.years_of_experience}
                onChange={handleChange}
                min="0"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-4 py-2.5 text-sm focus:border-legalGold focus:ring-1 focus:ring-legalGold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                name="consultation_fee"
                value={form.consultation_fee}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-navy-900 dark:text-white px-4 py-2.5 text-sm focus:border-legalGold focus:ring-1 focus:ring-legalGold outline-none"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="online_consultation"
                  checked={form.online_consultation}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                />
                <span>Online Video Consultation Available</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="offline_consultation"
                  checked={form.offline_consultation}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                />
                <span>Offline / In-Person Consultation Available</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="pro_bono_available"
                  checked={form.pro_bono_available}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                />
                <span>Pro-Bono (Free for Underprivileged) Available</span>
              </label>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Specializations
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPECIALIZATIONS.map(spec => (
                <label key={spec} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-950">
                  <input
                    type="checkbox"
                    value={spec}
                    checked={form.specializations.includes(spec)}
                    onChange={(e) => handleArrayChange(e, 'specializations')}
                    className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-950">
                  <input
                    type="checkbox"
                    value={lang}
                    checked={form.languages.includes(lang)}
                    onChange={(e) => handleArrayChange(e, 'languages')}
                    className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                  />
                  <span>{lang}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-legalGold hover:bg-yellow-500 text-navy-950 font-bold px-6 py-3 text-xs shadow-md transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
 );
}
