import { useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare, UserCheck, Scale, ExternalLink, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

const PANEL_LAWYERS = [
  {
    name: 'Adv. Jeevotham',
    phone: '9743720764',
    specialty: 'Criminal Law & Property Disputes',
    specialtyKn: 'ಕ್ರಿಮಿನಲ್ ಕಾನೂನು ಮತ್ತು ಆಸ್ತಿ ವಿವಾದಗಳು',
    district: 'Bengaluru Urban',
    experience: '12+ Years Experience',
  },
  {
    name: 'Adv. Shreyas',
    phone: '900805500',
    specialty: 'Family Law & Matrimonial Disputes',
    specialtyKn: 'ಕುಟುಂಬ ಕಾನೂನು ಮತ್ತು ವೈವಾಹಿಕ ವಿವಾದಗಳು',
    district: 'Mysuru',
    experience: '10+ Years Experience',
  },
  {
    name: 'Adv. Parinetha',
    phone: '9886260189',
    specialty: 'Women Protection & Civil Litigation',
    specialtyKn: 'ಮಹಿಳಾ ರಕ್ಷಣೆ ಮತ್ತು ಸಿವಿಲ್ ವ್ಯಾಜ್ಯಗಳು',
    district: 'Bengaluru Urban',
    experience: '8+ Years Experience',
  },
  {
    name: 'Adv. Purushotham',
    phone: '6364849617',
    specialty: 'Labour Disputes & Consumer Protection',
    specialtyKn: 'ಕಾರ್ಮಿಕ ವಿವಾದಗಳು ಮತ್ತು ಗ್ರಾಹಕರ ರಕ್ಷಣೆ',
    district: 'Dharwad',
    experience: '15+ Years Experience',
  },
];

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

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
    gender: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => {
      const newValues = { ...current, [name]: value };
      if (name === 'district') newValues.taluk = '';
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

      // After successful save, trigger Web3Forms Email
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (accessKey) {
        const formData = new FormData();
        formData.append("access_key", accessKey);
        formData.append("name", values.name || "Complainant");
        if (values.contact && values.contact.includes("@")) {
            formData.append("email", values.contact);
        }
        formData.append("subject", `New Complaint Registered: ${values.complaint_type}`);
        formData.append("message", `A new complaint has been successfully registered on Smart Karnataka Nyaya.\n\nComplaint ID: ${complaint.complaint_id}\nType: ${values.complaint_type}\nRouted To: ${complaint.routed_authority}\nDistrict: ${values.district}\nTaluk: ${values.taluk}\nGender: ${values.gender || 'Not specified'}\nPhone: ${values.phone || 'Not specified'}\n\nDescription:\n${values.description}\n\nThank you,\nSmart Karnataka Nyaya Team`);

        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
          });
          if (res.ok) {
            setSuccess("Complaint submitted successfully. Confirmation email sent.");
          } else {
            setSuccess("Complaint saved, but email notification could not be sent.");
          }
        } catch (e) {
          console.error("Web3Forms error:", e);
          setSuccess("Complaint saved, but email notification could not be sent.");
        }
      } else {
        setSuccess(`Complaint submitted. ID: ${complaint.complaint_id}. Routed to ${complaint.routed_authority}.`);
      }

      setValues((current) => ({ ...current, description: '' }));
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = "rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold transition-colors";
  
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
            {isKn ? 'ಸಂಪರ್ಕ & ನೇರ ವಕೀಲರ ಸೇವೆ' : 'Contact & Empanelled Lawyers'}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {isKn
              ? 'ಪನೆಲ್ ವಕೀಲರನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಅಧಿಕೃತ ದೂರು/ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.'
              : 'Directly speed dial DLSA empanelled advocates or submit your legal grievance online.'}
          </p>
        </div>
      </section>

      {/* Panel Advocates Speed Dial Section */}
      <section className="bg-slate-100/50 dark:bg-navy-900/50 py-12 md:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-legalGold bg-legalGold/10 px-3 py-1 rounded-full">
              <Scale className="h-3.5 w-3.5" />
              {isKn ? 'ಉಚಿತ ಮತ್ತು ಅನುಮೋದಿತ ವಕೀಲರ ಪಟ್ಟಿ' : 'DLSA Empanelled Panel Lawyers'}
            </span>
            <h2 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-3">
              {isKn ? 'ನೇರ ವಕೀಲರ ಸ್ಪೀಡ್ ಡಯಲ್' : 'Direct Speed Dial to Advocates'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {isKn
                ? 'ಯಾವುದೇ ವಿಳಂಬವಿಲ್ಲದೆ ತಕ್ಷಣವೇ ವಕೀಲರಿಗೆ ನೇರ ಕರೆ ಮಾಡಿ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಿ.'
                : 'Click to call directly on phone or send an instant WhatsApp message to panel lawyers.'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PANEL_LAWYERS.map((lawyer, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 p-6 shadow-sm hover:shadow-xl hover:border-legalGold transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-legalGold/10 text-legalGold font-serif font-bold text-lg flex items-center justify-center border border-legalGold/30">
                      {lawyer.name.split(' ')[1]?.[0] || 'A'}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white leading-tight">
                        {lawyer.name}
                      </h3>
                      <p className="text-xs text-legalGold font-semibold">{lawyer.district}</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-3">
                    {isKn ? lawyer.specialtyKn : lawyer.specialty}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{lawyer.experience}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {/* Speed Dial Phone Button */}
                  <a
                    href={`tel:${lawyer.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{isKn ? 'ನೇರ ಕರೆ ಮಾಡಿ:' : 'Call Speed Dial:'} {lawyer.phone}</span>
                  </a>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/91${lawyer.phone}?text=${encodeURIComponent('Hello Adv ' + lawyer.name + ', I need legal guidance regarding my case.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Form & Info Section */}
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
              <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mb-2">
                {isKn ? 'ಅಧಿಕೃತ ದೂರು / ಮನವಿ ಸಲ್ಲಿಸಿ' : 'Submit Official Grievance'}
              </h3>
              <input className={inputClassName} name="name" onChange={updateValue} placeholder={t('contact.namePlaceholder')} value={values.name} />
              <input className={inputClassName} name="contact" onChange={updateValue} placeholder={t('contact.contactPlaceholder')} value={values.contact} />
              
              <div className="grid gap-4 md:grid-cols-2">
                <input className={inputClassName} type="tel" name="phone" onChange={updateValue} placeholder={isKn ? "ಫೋನ್ ಸಂಖ್ಯೆ" : "Phone Number"} value={values.phone} />
                <select className={inputClassName} name="gender" onChange={updateValue} value={values.gender}>
                  <option value="" disabled>{isKn ? "ಲಿಂಗ ಆಯ್ಕೆಮಾಡಿ" : "Select Gender"}</option>
                  <option value="Male">{isKn ? "ಪುರುಷ" : "Male"}</option>
                  <option value="Female">{isKn ? "ಮಹಿಳೆ" : "Female"}</option>
                  <option value="Other">{isKn ? "ಇತರೆ" : "Other"}</option>
                  <option value="Prefer not to say">{isKn ? "ಹೇಳಲು ಇಷ್ಟವಿಲ್ಲ" : "Prefer not to say"}</option>
                </select>
              </div>
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
