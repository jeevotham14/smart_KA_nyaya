import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { advocateApi, getApiError } from '../services/api';
import { Scale, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { karnatakaDistricts } from '../data/mockData.js';

const SPECIALIZATIONS = [
  'Civil Law', 'Criminal Law', 'Family Law', 'Property Law',
  'Labour Law', 'Consumer Law', 'Cyber Law', 'Corporate Law', 'Tax Law'
];

const LANGUAGES = ['Kannada', 'English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Urdu'];

export default function AdvocateOnboarding() {
  const navigate = useNavigate();
  const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setForm(prev => {
      const current = prev[field];
      if (e.target.checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.district) {
      setError("District is required.");
      return;
    }
    if (form.specializations.length === 0) {
      setError("At least one specialization is required.");
      return;
    }
    if (form.languages.length === 0) {
      setError("At least one language is required.");
      return;
    }
    if (form.years_of_experience < 0 || form.consultation_fee < 0) {
      setError("Experience and fee must be non-negative.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await advocateApi.createProfile({
        ...form,
        years_of_experience: Number(form.years_of_experience),
        consultation_fee: Number(form.consultation_fee)
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-legalGold/10 p-3 rounded-full">
              <Scale className="h-8 w-8 text-legalGold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-navy-900 dark:text-white">Complete Your Advocate Profile</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Please provide your professional details for verification.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 flex gap-3 text-sm text-alertRed border border-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
                <input required type="text" name="full_name" value={form.full_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bar Council Number *</label>
                <input required type="text" name="bar_council_number" value={form.bar_council_number} onChange={handleChange} placeholder="e.g. KAR/123/2020" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">District *</label>
                <select required name="district" value={form.district} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold">
                  <option value="">Select District</option>
                  {DISTRICT_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Experience (Years) *</label>
                <input required type="number" min="0" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Consultation Fee (₹) *</label>
                <input required type="number" min="0" name="consultation_fee" value={form.consultation_fee} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Specializations (Select at least one) *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SPECIALIZATIONS.map(spec => (
                  <label key={spec} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" value={spec} checked={form.specializations.includes(spec)} onChange={(e) => handleArrayChange(e, 'specializations')} className="text-legalGold focus:ring-legalGold rounded border-slate-300" />
                    {spec}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Languages (Select at least one) *</label>
              <div className="flex flex-wrap gap-4">
                {LANGUAGES.map(lang => (
                  <label key={lang} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" value={lang} checked={form.languages.includes(lang)} onChange={(e) => handleArrayChange(e, 'languages')} className="text-legalGold focus:ring-legalGold rounded border-slate-300" />
                    {lang}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Consultation Modes</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" name="online_consultation" checked={form.online_consultation} onChange={handleChange} className="text-legalGold focus:ring-legalGold rounded border-slate-300" />
                  Online Consultation
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" name="offline_consultation" checked={form.offline_consultation} onChange={handleChange} className="text-legalGold focus:ring-legalGold rounded border-slate-300" />
                  Offline Consultation
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" name="pro_bono_available" checked={form.pro_bono_available} onChange={handleChange} className="text-legalGold focus:ring-legalGold rounded border-slate-300" />
                  Available for Pro-Bono
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Bio / About Me</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 p-2 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold"></textarea>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-legalGold px-6 py-3 text-sm font-bold text-navy-900 transition-all hover:bg-yellow-500 disabled:opacity-50 flex justify-center items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Profile for Verification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
