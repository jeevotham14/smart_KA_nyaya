import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Download, Eye, FileText, Printer, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import DownloadButtons from '../components/DownloadButtons.jsx';
import DocumentPreview from '../components/DocumentPreview.jsx';
import { useDraftManager } from '../components/DraftManager.jsx';
import { karnatakaDistricts, documentTemplates } from '../data/mockData.js';
const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();
import { getApiError, legalApi } from '../services/api.js';

const documentTypes = Object.keys(documentTemplates);

function buildDraft(values) {
  const type = values.type || 'Complaint';
  const template = documentTemplates[type] || documentTemplates.Complaint;
  return `${template.heading}\n\nApplicant: ${values.name || '[Applicant name]'}\nDistrict: ${values.district || '[District]'}\nOpposite party / authority: ${values.respondent || '[Name or authority]'}\nDate of incident / issue: ${values.issueDate || '[Date]'}\n\nFacts:\n${values.facts || '[Write facts in chronological order. Include dates, places, documents, witnesses, and requested action.]'}\n\nRelief / request:\n${values.relief || template.request}\n\nDeclaration:\nThe above draft is generated from user-provided facts for legal information and preparation support only.`;
}

export default function DocumentGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const { draft, setDraft, saveDraft, saved } = useDraftManager('docGenDraft', buildDraft({ type: 'Complaint' }));
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

  useEffect(() => {
    if (!draft || activeTab === 'editor') {
      // Keep draft updated with liveDraft when not edited manually? 
      // User can manually edit in editor tab. We won't strictly override unless they click 'Generate Draft'.
    }
  }, [liveDraft]);

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => alert('Downloading PDF...'); // Mock PDF download
  const handleDownloadDocx = () => alert('Downloading DOCX...'); // Mock DOCX download


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
              <FormInput label={t('docGen.districtLabel')} name="district" register={register} options={DISTRICT_NAMES} />
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
              <button className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-800 px-5 py-3 text-sm font-bold text-navy-800 hover:bg-slate-50 transition-colors" onClick={() => saveDraft(draft)} type="button">
                <Save className="h-4 w-4" aria-hidden="true" />
                {t('docGen.saveDraft')}
              </button>
            </div>
            {success ? <p className="mt-3 rounded-sm bg-emerald-50 p-3 text-sm font-semibold text-aidGreen">{success}</p> : null}
            {error ? <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm font-semibold text-alertRed">{error}</p> : null}
            {saved ? <p className="mt-3 rounded-sm bg-emerald-50 p-3 text-sm font-semibold text-aidGreen">{t('docGen.draftSaved')}</p> : null}
          </form>
          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900">{t('docGen.previewTitle')}</h3>
                <p className="mt-1 text-sm text-slate-600">{t('docGen.previewDesc')}</p>
              </div>
              <DownloadButtons 
                onPrint={handlePrint} 
                onDownloadPdf={handleDownloadPdf} 
                onDownloadDocx={handleDownloadDocx} 
                onSave={() => saveDraft(draft)}
                saved={saved} 
              />
            </div>
            
            <div className="mt-4 flex gap-4 border-b border-slate-200">
              <button 
                type="button"
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'editor' ? 'border-legalGold text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-900'}`}
                onClick={() => setActiveTab('editor')}
              >
                Draft Editor
              </button>
              <button 
                type="button"
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'preview' ? 'border-legalGold text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-900'}`}
                onClick={() => setActiveTab('preview')}
              >
                Print Preview
              </button>
            </div>

            <div className="flex-1 mt-5">
              {activeTab === 'editor' ? (
                <textarea
                  className="h-full min-h-[520px] w-full resize-none rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              ) : (
                <DocumentPreview content={draft} />
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{t('disclaimer')}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
