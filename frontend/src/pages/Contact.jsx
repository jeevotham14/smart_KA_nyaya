import { useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function Contact() {
  const { t } = useTranslation();

  const complaintTypes = [
    { value: 'general', label: t('contact.complaintGeneral') },
    { value: 'police complaint', label: t('contact.complaintPolice') },
    { value: 'domestic violence', label: t('contact.complaintDV') },
    { value: 'women protection', label: t('contact.complaintWomen') },
    { value: 'legal aid request', label: t('contact.complaintLegalAid') },
    { value: 'public grievance', label: t('contact.complaintGrievance') },
  ];

  const [values, setValues] = useState({
    name: '',
    contact: '',
    complaint_type: 'general',
    description: '',
    district: '',
    taluk: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      const newValues = { ...current, [name]: value };
      if (name === 'district') newValues.taluk = ''; // reset taluk on district change
      return newValues;
    });
  };

  const availableTaluks = values.district && karnatakaDistricts[values.district] 
    ? [...karnatakaDistricts[values.district]].sort() 
    : [];

  const submitComplaint = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const complaint = await legalApi.submitComplaint({
        ...values,
        description: `${values.description}\n\nComplainant: ${values.name || '[not provided]'}\nContact: ${values.contact || '[not provided]'}`,
      });
      setSuccess(`Complaint submitted. ID: ${complaint.complaint_id}. Routed to ${complaint.routed_authority}.`);
      setValues((current) => ({ ...current, description: '' }));
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-3 py-3 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold transition-colors";
  
  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <MessageSquare className="h-3.5 w-3.5" /> {t('contact.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('contact.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('contact.desc')}
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              {[[Phone, t('contact.helplines'), '112, 181, 1098'], [Mail, t('contact.email'), 'support@smartnyaya.karnataka'], [MapPin, t('contact.office'), 'Bengaluru, Karnataka']].map(([Icon, title, value]) => (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" key={title}>
                  <Icon className="h-6 w-6 text-legalGold" />
                  <p className="mt-3 font-bold text-navy-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{value}</p>
                </div>
              ))}
            </div>
            <form className="grid gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel" onSubmit={submitComplaint}>
              <input className={inputClassName} name="name" onChange={updateValue} placeholder={t('contact.namePlaceholder')} value={values.name} />
              <input className={inputClassName} name="contact" onChange={updateValue} placeholder={t('contact.contactPlaceholder')} value={values.contact} />
              <select className={inputClassName} name="complaint_type" onChange={updateValue} value={values.complaint_type}>
                {complaintTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <div className="grid gap-4 md:grid-cols-2">
                <select className={inputClassName} name="district" onChange={updateValue} value={values.district}>
                  <option value="">Select District</option>
                  {DISTRICT_NAMES.map((district) => <option key={district} value={district}>{district}</option>)}
                </select>
                <select className={`${inputClassName} disabled:opacity-50`} name="taluk" onChange={updateValue} value={values.taluk} disabled={availableTaluks.length === 0}>
                  <option value="">Select Taluk</option>
                  {availableTaluks.map((taluk) => <option key={taluk} value={taluk}>{taluk}</option>)}
                </select>
              </div>
              <textarea className={`min-h-[9rem] ${inputClassName}`} name="description" onChange={updateValue} placeholder={t('contact.descriptionPlaceholder')} required value={values.description} />
              <button className="premium-btn premium-btn-gold text-sm mt-2 disabled:opacity-60" disabled={loading} type="submit">
                {loading ? t('contact.submitting') : t('contact.submitComplaint')}
              </button>
              {success ? <p className="rounded-sm bg-emerald-50 dark:bg-emerald-900/30 p-3 text-sm font-semibold text-aidGreen dark:text-emerald-400">{success}</p> : null}
              {error ? <p className="rounded-sm bg-red-50 dark:bg-red-900/30 p-3 text-sm font-semibold text-alertRed dark:text-red-400">{error}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
