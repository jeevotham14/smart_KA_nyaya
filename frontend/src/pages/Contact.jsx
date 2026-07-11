import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, taluks } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

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
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru North',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

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

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('contact.eyebrow')} title={t('contact.title')}>
          {t('contact.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {[[Phone, t('contact.helplines'), '112, 181, 1098'], [Mail, t('contact.email'), 'support@smartnyaya.karnataka'], [MapPin, t('contact.office'), 'Bengaluru, Karnataka']].map(([Icon, title, value]) => (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-5" key={title}>
                <Icon className="h-6 w-6 text-legalGold" />
                <p className="mt-3 font-bold text-navy-900">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{value}</p>
              </div>
            ))}
          </div>
          <form className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitComplaint}>
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="name" onChange={updateValue} placeholder={t('contact.namePlaceholder')} value={values.name} />
            <input className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="contact" onChange={updateValue} placeholder={t('contact.contactPlaceholder')} value={values.contact} />
            <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="complaint_type" onChange={updateValue} value={values.complaint_type}>
              {complaintTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <div className="grid gap-4 md:grid-cols-2">
              <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="district" onChange={updateValue} value={values.district}>
                {districts.map((district) => <option key={district}>{district}</option>)}
              </select>
              <select className="rounded-sm border border-slate-300 px-3 py-3 text-sm" name="taluk" onChange={updateValue} value={values.taluk}>
                {taluks.map((taluk) => <option key={taluk}>{taluk}</option>)}
              </select>
            </div>
            <textarea className="min-h-36 rounded-sm border border-slate-300 px-3 py-3 text-sm" name="description" onChange={updateValue} placeholder={t('contact.descriptionPlaceholder')} required value={values.description} />
            <button className="rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading} type="submit">
              {loading ? t('contact.submitting') : t('contact.submitComplaint')}
            </button>
            {success ? <p className="rounded-sm bg-emerald-50 p-3 text-sm font-semibold text-aidGreen">{success}</p> : null}
            {error ? <p className="rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{error}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
