import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Eye, FileText, Printer, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, documentTemplates } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

const documentTypes = Object.keys(documentTemplates);

function buildDraft(values) {
  const type = values.type || 'Complaint';
  const template = documentTemplates[type] || documentTemplates.Complaint;
  return `${template.heading}\n\nApplicant: ${values.name || '[Applicant name]'}\nDistrict: ${values.district || '[District]'}\nOpposite party / authority: ${values.respondent || '[Name or authority]'}\nDate of incident / issue: ${values.issueDate || '[Date]'}\n\nFacts:\n${values.facts || '[Write facts in chronological order. Include dates, places, documents, witnesses, and requested action.]'}\n\nRelief / request:\n${values.relief || template.request}\n\nDeclaration:\nThe above draft is generated from user-provided facts for legal information and preparation support only.`;
}

export default function DocumentGenerator() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(buildDraft({ type: 'Complaint' }));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      type: 'Complaint',
      name: 'Asha R',
      district: 'Bengaluru Urban',
      respondent: 'Concerned authority',
      issueDate: '2026-06-27',
      facts: 'I need help preparing a clear draft based on the facts of my issue.',
      relief: '',
    },
  });
  const values = watch();
  const liveDraft = useMemo(() => buildDraft(values), [values]);

  const onSubmit = async (formValues) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSaved(false);
    try {
      const document = await legalApi.generateDocument(formValues);
      setDraft(document.content_text);
      setSuccess(`Generated document ${document.doc_id}.`);
    } catch (apiError) {
      setError(getApiError(apiError));
      setDraft(liveDraft);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('docGen.eyebrow')} title={t('docGen.title')}>
          {t('docGen.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <form className="rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-navy-50 text-navy-800">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">{t('docGen.draftFacts')}</h3>
                <p className="text-sm text-slate-600">{t('docGen.draftFactsDesc')}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormInput label={t('docGen.docType')} name="type" register={register} options={documentTypes} />
              <FormInput label={t('docGen.districtLabel')} name="district" register={register} options={districts} />
              <FormInput label={t('docGen.applicantName')} name="name" register={register} />
              <FormInput label={t('docGen.oppositeParty')} name="respondent" register={register} />
              <FormInput label={t('docGen.dateOfIssue')} name="issueDate" register={register} type="date" />
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-navy-900">{t('docGen.userFacts')}</span>
                <textarea className="mt-2 min-h-32 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20" {...register('facts')} />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-navy-900">{t('docGen.requestedRelief')}</span>
                <textarea className="mt-2 min-h-24 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20" placeholder={t('docGen.reliefPlaceholder')} {...register('relief')} />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading} type="submit">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {loading ? t('docGen.generating') : t('docGen.generateDraft')}
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-800 px-5 py-3 text-sm font-bold text-navy-800" onClick={() => setSaved(true)} type="button">
                <Save className="h-4 w-4" aria-hidden="true" />
                {t('docGen.saveDraft')}
              </button>
            </div>
            {success ? <p className="mt-3 rounded-sm bg-emerald-50 p-3 text-sm font-semibold text-aidGreen">{success}</p> : null}
            {error ? <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{error}</p> : null}
            {saved ? <p className="mt-3 rounded-sm bg-emerald-50 p-3 text-sm font-semibold text-aidGreen">{t('docGen.draftSaved')}</p> : null}
          </form>
          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">{t('docGen.previewTitle')}</h3>
                <p className="mt-1 text-sm text-slate-600">{t('docGen.previewDesc')}</p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 text-navy-800" title={t('docGen.printPlaceholder')} type="button">
                  <Printer className="h-4 w-4" aria-hidden="true" />
                </button>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-legalGold text-navy-900" title={t('docGen.downloadPlaceholder')} type="button">
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <pre className="mt-5 min-h-[520px] whitespace-pre-wrap rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{draft}</pre>
            <p className="mt-4 text-xs leading-5 text-slate-500">{t('disclaimer')}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
