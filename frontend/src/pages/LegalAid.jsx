import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ClipboardCheck, FileText, Info, Scale, UserCheck } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, taluks } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

export default function LegalAid() {
  const [result, setResult] = useState(null);
  const [submittedValues, setSubmittedValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru North',
      income: 'Below Rs. 1 lakh',
      gender: 'Female',
      category: 'General',
      disability: 'No',
      caseType: 'Family',
    },
  });
  const currentValues = watch();

  const { t } = useTranslation();

  const incomeOptions = [t('legalAid.incomeBelow1L'), t('legalAid.income1to3L'), t('legalAid.incomeAbove3L')];
  const caseTypes = [t('legalAid.family'), t('legalAid.civil'), t('legalAid.criminal'), t('legalAid.labourCase'), t('legalAid.consumerCase'), t('legalAid.domesticViolence'), t('legalAid.propertyCase')];

  function getReasons(values) {
    const reasons = [];
    if (values.gender === 'Female') reasons.push(t('legalAid.reasonWomen'));
    if (values.category === 'SC/ST') reasons.push(t('legalAid.reasonSCST'));
    if (values.category === 'Minority') reasons.push(t('legalAid.reasonMinority'));
    if (values.disability === 'Yes') reasons.push(t('legalAid.reasonDisability'));
    if (values.income === 'Below Rs. 1 lakh') reasons.push(t('legalAid.reasonLowIncome'));
    if (values.caseType === 'Domestic violence') reasons.push(t('legalAid.reasonDV'));
    return reasons.length ? reasons : [t('legalAid.reasonDefault')];
  }

  const liveReasons = useMemo(() => getReasons(currentValues), [currentValues, t]);

  const onSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSubmittedValues(values);
    try {
      setResult(await legalApi.checkEligibility(values));
    } catch (apiError) {
      setError(getApiError(apiError));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('legalAid.eyebrow')} title={t('legalAid.title')}>
          {t('legalAid.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.82fr]">
          <form className="rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-emerald-50 text-aidGreen">
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">{t('legalAid.applicantDetails')}</h3>
                <p className="text-sm text-slate-600">{t('legalAid.applicantDetailsDesc')}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormInput label={t('legalAid.districtLabel')} name="district" register={register} options={districts} error={errors.district} required />
              <FormInput label={t('legalAid.talukLabel')} name="taluk" register={register} options={taluks} error={errors.taluk} required />
              <FormInput label={t('legalAid.incomeRange')} name="income" register={register} options={incomeOptions} />
              <FormInput label={t('legalAid.gender')} name="gender" register={register} options={[t('legalAid.female'), t('legalAid.male'), t('legalAid.other')]} />
              <FormInput label={t('legalAid.casteCategory')} name="category" register={register} options={[t('legalAid.general'), t('legalAid.scst'), t('legalAid.obc'), t('legalAid.minority')]} />
              <FormInput label={t('legalAid.disabilityStatus')} name="disability" register={register} options={[t('legalAid.no'), t('legalAid.yes')]} />
              <FormInput label={t('legalAid.caseType')} name="caseType" register={register} options={caseTypes} />
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">{t('legalAid.indicativeNote')}</p>
              <button className="rounded-sm bg-aidGreen px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading} type="submit">
                {loading ? t('legalAid.checking') : t('legalAid.checkEligibility')}
              </button>
            </div>
          </form>
          <aside className="grid gap-5">
            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-navy-900">{t('legalAid.liveFactors')}</h3>
              <div className="mt-5 grid gap-3">
                {liveReasons.map((reason) => (
                  <p className="flex gap-3 rounded-sm bg-slate-50 p-3 text-sm leading-6 text-slate-700" key={reason}>
                    <Info className="mt-1 h-4 w-4 shrink-0 text-legalGold" aria-hidden="true" />
                    {reason}
                  </p>
                ))}
              </div>
            </section>
            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-navy-900">{t('legalAid.eligibilityResult')}</h3>
              {error ? <p className="mt-5 rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{error}</p> : null}
              {result ? (
                <div className="mt-5 rounded-sm border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  <CheckCircle2 className="mb-3 h-7 w-7 text-aidGreen" aria-hidden="true" />
                  <p className="font-bold">{result.eligible ? t('legalAid.eligible') : t('legalAid.needsReview')}</p>
                  <p className="mt-2">{result.reason}</p>
                  <p className="mt-2 text-xs">{result.disclaimer}</p>
                  <div className="mt-4 grid gap-2 border-t border-emerald-200 pt-4">
                    <p className="font-semibold">{t('legalAid.suggestedDocs')}</p>
                    <p>{t('legalAid.suggestedDocsDesc')}</p>
                  </div>
                </div>
              ) : !error ? (
                <p className="mt-5 text-sm leading-6 text-slate-600">{t('legalAid.submitPrompt')}</p>
              ) : null}
            </section>
          </aside>
        </div>
        {submittedValues ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [Scale, t('legalAid.nearestAuthority'), `${submittedValues.district} DLSA / TLSC desk`],
              [ClipboardCheck, t('legalAid.applicationStatus'), result ? t('legalAid.backendReceived') : t('legalAid.draftReady')],
              [FileText, t('legalAid.caseTypeLabel'), submittedValues.caseType],
            ].map(([Icon, label, value]) => (
              <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" key={label}>
                <Icon className="h-6 w-6 text-legalGold" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-navy-900">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{value}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
