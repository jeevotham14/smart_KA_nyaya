import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle2, ClipboardCheck, FileText, Info, Scale, UserCheck, ShieldCheck, Download, AlertTriangle, ArrowRight } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function LegalAid() {
  const [result, setResult] = useState(null);
  const [submittedValues, setSubmittedValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru North',
      income: 150000,
      gender: 'Female',
      category: 'Women',
      disability: false,
      caseType: 'Family',
      is_senior_citizen: false,
      is_child: false,
      is_transgender: false,
      is_ex_serviceman: false,
      is_industrial_workmen: false,
      urgent_safety_concern: false,
    },
  });

  const currentValues = watch();
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const CATEGORY_OPTIONS = [
    { value: 'Women', label: isKn ? 'ಮಹಿಳೆಯರು (ಸ್ವಯಂಚಾಲಿತ ಅರ್ಹತೆ)' : 'Women (Auto-Eligible)' },
    { value: 'SC/ST', label: isKn ? 'ಪರಿಶಿಷ್ಟ ಜಾತಿ / ಪರಿಶಿಷ್ಟ ಪಂಗಡ (SC/ST)' : 'SC / ST Community (Auto-Eligible)' },
    { value: 'Child', label: isKn ? 'ಮಕ್ಕಳು (18 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ)' : 'Child / Minor under 18 (Auto-Eligible)' },
    { value: 'Disability', label: isKn ? 'ವಿಕಲಚೇತನರು (PWD)' : 'Person with Disability (Auto-Eligible)' },
    { value: 'Senior Citizen', label: isKn ? 'ಹಿರಿಯ ನಾಗರಿಕರು (60+)' : 'Senior Citizen 60+ (Auto-Eligible)' },
    { value: 'Transgender', label: isKn ? 'ತೃತೀಯ ಲಿಂಗಿಗಳು' : 'Transgender Person (Auto-Eligible)' },
    { value: 'Industrial Workmen', label: isKn ? 'ಕೈಗಾರಿಕಾ ಕಾರ್ಮಿಕರು' : 'Industrial Workman (Auto-Eligible)' },
    { value: 'Ex-serviceman', label: isKn ? 'ಮಾಜಿ ಸೈನಿಕರು / ಸ್ವಾತಂತ್ರ್ಯ ಹೋರಾಟಗಾರರು' : 'Ex-serviceman / Freedom Fighter' },
    { value: 'General', label: isKn ? 'ಸಾಮಾನ್ಯ ವರ್ಗ (ಆದಾಯ ಮಿತಿ ರೂ. 3 ಲಕ್ಷ)' : 'General Category (Income <= Rs. 3 Lakh)' },
  ];

  const AUTO_ELIGIBLE_SETS = new Set(['Women', 'SC/ST', 'Child', 'Disability', 'Senior Citizen', 'Transgender', 'Industrial Workmen', 'Ex-serviceman']);
  const isAutoEligibleCategory = AUTO_ELIGIBLE_SETS.has(currentValues.category) || currentValues.gender === 'Female' || currentValues.disability;

  const availableTaluks = currentValues.district && karnatakaDistricts[currentValues.district] ? [...karnatakaDistricts[currentValues.district]].sort() : [];

  const onSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSubmittedValues(values);
    try {
      const payload = {
        gender: values.gender,
        category: values.category,
        annual_income: isAutoEligibleCategory ? 0 : Number(values.income || 0),
        disability: values.category === 'Disability' || Boolean(values.disability),
        case_type: values.caseType,
        is_child: values.category === 'Child',
        is_senior_citizen: values.category === 'Senior Citizen',
        is_transgender: values.category === 'Transgender',
        is_ex_serviceman: values.category === 'Ex-serviceman',
        is_industrial_workmen: values.category === 'Industrial Workmen',
        district: values.district,
        urgent_safety_concern: values.urgent_safety_concern,
      };
      const res = await legalApi.checkEligibility(payload);
      setResult(res);
    } catch (apiError) {
      setError(getApiError(apiError));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDLSAForm = () => {
    const textContent = `
DISTRICT LEGAL SERVICES AUTHORITY (DLSA) — FREE LEGAL AID APPLICATION
=====================================================================
State: Karnataka
District: ${submittedValues?.district || 'Bengaluru Urban'}
Taluk: ${submittedValues?.taluk || 'Bengaluru North'}

APPLICANT DETAILS:
------------------
Gender: ${submittedValues?.gender || 'N/A'}
Category: ${submittedValues?.category || 'N/A'}
Case Type: ${submittedValues?.caseType || 'N/A'}
Eligible Under: Section 12, Legal Services Authorities Act 1987

DECLARATION:
------------
I hereby declare that the information provided is true to the best of my knowledge.
I request the DLSA/TLSC to provide me with a panel advocate and free legal representation.

Date: ${new Date().toLocaleDateString()}
Signature: __________________________
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DLSA_Legal_Aid_Application_${submittedValues?.district || 'Karnataka'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <Scale className="h-3.5 w-3.5" /> {isKn ? 'ಸೆಕ್ಷನ್ 12 ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ ಕಾಯ್ದೆ 1987' : 'Section 12 Legal Services Authorities Act 1987'}
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('legalAid.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {isKn
              ? 'ಕರ್ನಾಟಕದ ಪ್ರತಿಯೊಬ್ಬ ಅರ್ಹ ನಾಗರಿಕನಿಗೆ ವಕೀಲರ ಉಚಿತ ಸೇವೆ, ಕೋರ್ಟ್ ಫೀ ಮನ್ನಾ ಮತ್ತು ಉಚಿತ ಕಾನೂನು ನೆರವು.'
              : 'Free advocate representation, court fee exemption, and document assistance for Karnataka citizens.'}
          </p>
        </div>
      </section>

      <section className="bg-surface dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section 12 Explainer Box */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-slate-900 border border-legalGold/40 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-legalGold shrink-0 mt-1" />
              <div>
                <h3 className="font-serif text-lg font-bold text-legalGold">
                  {isKn ? 'ಉಚಿತ ಕಾನೂನು ನೆರವು ಪಡೆಯಲು ಯಾರು ಅರ್ಹರು?' : 'What Free Legal Aid Covers (Section 12)'}
                </h3>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {isKn
                    ? 'ಮಹಿಳೆಯರು, ಮಕ್ಕಳು, SC/ST, ವಿಕಲಚೇತನರು, ಹಿರಿಯ ನಾಗರಿಕರು, ತೃತೀಯ ಲಿಂಗಿಗಳು ಮತ್ತು ವಾರ್ಷಿಕ ಆದಾಯ ರೂ. 3 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆಯಿರುವ ವ್ಯಕ್ತಿಗಳು ವಕೀಲರ ಉಚಿತ ಸೇವೆ ಮತ್ತು ಕೋರ್ಟ್ ವೆಚ್ಚಗಳಿಗೆ ಅರ್ಹರಾಗಿದ್ದಾರೆ.'
                    : 'Covers: Free panel advocate services, court fee exemption, legal document drafting, paper book preparation, and translated court records.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            {/* Form */}
            <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-emerald-50 dark:bg-emerald-900/30 text-aidGreen dark:text-emerald-400">
                  <UserCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('legalAid.applicantDetails')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('legalAid.applicantDetailsDesc')}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <FormInput label={t('legalAid.districtLabel')} name="district" register={register} options={DISTRICT_NAMES} error={errors.district} required />
                <FormInput label={t('legalAid.talukLabel')} name="taluk" register={register} options={availableTaluks} error={errors.taluk} required />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">
                    {isKn ? 'ಅರ್ಹತಾ ವರ್ಗ (ಕಾಯ್ದೆಯಡಿ)' : 'Category under Section 12'}
                  </label>
                  <select
                    {...register('category')}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white focus:border-legalGold focus:ring-1 focus:ring-legalGold"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Income Field */}
                {!isAutoEligibleCategory ? (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-navy-900 dark:text-white mb-1.5">
                      {isKn ? 'ವಾರ್ಷಿಕ ಕುಟುಂಬ ಆದಾಯ (ರೂ.)' : 'Annual Household Income (INR)'}
                    </label>
                    <input
                      type="number"
                      placeholder="300000"
                      {...register('income', { valueAsNumber: true })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white focus:border-legalGold"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {isKn ? 'ಕರ್ನಾಟಕ ಡಿಎಲ್‌ಎಸ್‌ಎ ಆದಾಯ ಮಿತಿ: ರೂ. 3,00,000 / ವರ್ಷ' : 'Karnataka DLSA income limit threshold: Rs. 3,00,000 per annum'}
                    </p>
                  </div>
                ) : (
                  <div className="md:col-span-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span>
                      {isKn
                        ? 'ಆಯ್ದ ವರ್ಗಕ್ಕೆ ಕಾಯ್ದೆಯಡಿ ಸ್ವಯಂಚಾಲಿತ ಉಚಿತ ಕಾನೂನು ನೆರವು ಲಭ್ಯವಿದೆ. ಆದಾಯ ಪರಿಶೀಲನೆಯ ಅಗತ್ಯವಿಲ್ಲ.'
                        : 'Auto-Eligible under Section 12. Income test is waived for this category.'}
                    </span>
                  </div>
                )}

                <FormInput label={t('legalAid.gender')} name="gender" register={register} options={[t('legalAid.female'), t('legalAid.male'), t('legalAid.other')]} />
                <FormInput label={t('legalAid.caseType')} name="caseType" register={register} options={['consumer', 'property', 'family', 'employment', 'cyber', 'criminal', 'domestic_violence']} />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent_safety_concern"
                  {...register('urgent_safety_concern')}
                  className="h-4 w-4 rounded border-slate-300 text-alertRed focus:ring-alertRed"
                />
                <label htmlFor="urgent_safety_concern" className="text-sm font-semibold text-alertRed">
                  {isKn ? 'ಇದು ತುರ್ತು ಸುರಕ್ಷತಾ ಕಾಳಜಿಯಾಗಿದೆ (ಉದಾ: ಗೃಹ ಹಿಂಸೆ)' : 'This is an urgent safety concern (e.g., domestic violence)'}
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{t('legalAid.indicativeNote')}</p>
                <button className="premium-btn premium-btn-gold text-sm disabled:opacity-60" disabled={loading} type="submit">
                  {loading ? t('legalAid.checking') : t('legalAid.checkEligibility')}
                </button>
              </div>
            </form>

            {/* Results Sidebar */}
            <aside className="grid gap-5">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('legalAid.eligibilityResult')}</h3>
                {error ? <p className="mt-5 rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm font-semibold text-alertRed dark:text-red-400">{error}</p> : null}
                {result ? (
                  <div className={`mt-5 rounded-xl border p-5 text-sm leading-6 ${result.tailored_guidance?.priority === 'emergency' ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40 text-red-900 dark:text-red-100' : result.eligible ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100' : 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      {result.tailored_guidance?.priority === 'emergency' ? (
                        <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
                      ) : result.eligible ? (
                        <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                      )}
                      <div>
                        <p className="font-bold text-base">
                          {result.tailored_guidance ? result.tailored_guidance.title : (result.eligible ? (isKn ? 'ನೀವು ಉಚಿತ ಕಾನೂನು ನೆರವಿಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ!' : 'Eligible for Free Legal Aid!') : (isKn ? 'ಆದಾಯ ಮಿತಿ ಮೀರಿದೆ —ರ್ಯಾಯ ಮಾರ್ಗಗಳು' : 'Exceeds Income Threshold — Alternate Options'))}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 font-medium">{result.tailored_guidance ? result.tailored_guidance.description : result.reason}</p>

                    {result.tailored_guidance && result.tailored_guidance.actions?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-opacity-30 border-current space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider">{isKn ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು:' : 'Recommended Actions:'}</p>
                        <div className="flex flex-col gap-2">
                           {result.tailored_guidance.actions.map((action, idx) => (
                             <button key={idx} onClick={() => { if(action.label === 'Apply for Free Legal Aid') handleDownloadDLSAForm(); }} className={`premium-btn text-xs py-2.5 flex items-center justify-center gap-2 ${result.tailored_guidance.priority === 'emergency' ? 'premium-btn-red bg-alertRed text-white hover:bg-red-700' : 'premium-btn-gold'}`}>
                               <span>{action.label}</span>
                             </button>
                           ))}
                        </div>
                      </div>
                    )}

                    {result.tailored_guidance && result.tailored_guidance.emergency_numbers?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-opacity-30 border-current space-y-2">
                         <p className="text-xs font-bold uppercase tracking-wider">{isKn ? 'ತುರ್ತು ಸಂಪರ್ಕಗಳು:' : 'Emergency Contacts:'}</p>
                         <div className="flex gap-3">
                           {result.tailored_guidance.emergency_numbers.map((num, idx) => (
                              <a key={idx} href={`tel:${num}`} className="font-bold text-lg text-red-600 dark:text-red-400 underline">{num}</a>
                           ))}
                         </div>
                      </div>
                    )}

                    {result.tailored_guidance && result.tailored_guidance.recommended_documents?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-opacity-30 border-current space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider">{isKn ? 'ದಾಖಲೆಗಳು:' : 'Documents:'}</p>
                        {result.tailored_guidance.recommended_documents.map((doc, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.tailored_guidance && result.tailored_guidance.recommended_resources?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-opacity-30 border-current space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider">{isKn ? 'ಮಾರ್ಗದರ್ಶಿಗಳು:' : 'Guides:'}</p>
                        {result.tailored_guidance.recommended_resources.map((res, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ) : !error ? (
                  <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">{t('legalAid.submitPrompt')}</p>
                ) : null}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
