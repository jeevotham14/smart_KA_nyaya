import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, FileText, Save, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FormInput from '../components/FormInput.jsx';
import DownloadButtons from '../components/DownloadButtons.jsx';
import DocumentPreview from '../components/DocumentPreview.jsx';
import { useDraftManager } from '../components/DraftManager.jsx';
import { karnatakaDistricts, documentTemplates } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();
const documentTypes = Object.keys(documentTemplates);

function buildDraft(values) {
  const type = values.type || 'Complaint';
  
  if (type === 'Vakalatnama placeholder') {
    return `IN THE ${values.courtName || '[COURT NAME]'}
AT ${values.place || '[PLACE]'}

CASE NO. ${values.caseNumber || '[CASE NUMBER]'}

${values.petitioner || '[PETITIONER NAME]'} ... Petitioner / Plaintiff

VERSUS

${values.respondent || '[RESPONDENT NAME]'} ... Respondent / Defendant

VAKALATNAMA

I/We, ${values.petitioner || '[NAME]'}, residing at ${values.clientAddress || '[CLIENT ADDRESS]'}, do hereby appoint and retain ${values.advocateName || '[ADVOCATE NAME]'}, Advocate (Enrollment No: ${values.enrollmentNumber || '[ENROLLMENT NUMBER]'}), having office at ${values.officeAddress || '[OFFICE ADDRESS]'}, to act, appear and plead for me/us in the above-mentioned matter.

I/We authorize the said Advocate to:
1. File, present, and defend any application, petition, or reply.
2. Produce and receive documents/money.
3. Accept service of notice or summons.
4. Compromise, compound, or withdraw the case if deemed necessary.

I/We agree to ratify all acts done by the said Advocate in pursuance of this authority.

Date: ${values.issueDate || '[DATE]'}
Place: ${values.place || '[PLACE]'}

______________________
Signature of Client (Executant)

ACCEPTED
______________________
Signature of Advocate
${values.advocateName || '[ADVOCATE NAME]'}
`;
  }
  
  const template = documentTemplates[type] || documentTemplates.Complaint;
  return `${template.heading}\n\nApplicant: ${values.name || '[Applicant name]'}\nDistrict: ${values.district || '[District]'}\nOpposite party / authority: ${values.respondent || '[Name or authority]'}\nDate of incident / issue: ${values.issueDate || '[Date]'}\n\nFacts:\n${values.facts || '[Write facts in chronological order. Include dates, places, documents, witnesses, and requested action.]'}\n\nRelief / request:\n${values.relief || template.request}\n\nDeclaration:\nThe above draft is generated from user-provided facts for legal information and preparation support only.`;
}

export default function DocumentGenerator() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const { draft, setDraft, saveDraft, saved } = useDraftManager('docGenDraft', buildDraft({ type: 'Complaint' }));
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      type: 'Complaint',
      name: '',
      district: DISTRICT_NAMES[0],
      respondent: '',
      issueDate: '',
      facts: '',
      relief: '',
      courtName: 'HIGH COURT OF KARNATAKA',
      caseNumber: '',
      petitioner: '',
      advocateName: '',
      enrollmentNumber: '',
      officeAddress: '',
      clientAddress: '',
      place: 'Bengaluru',
    },
  });
  
  const values = watch();
  const liveDraft = useMemo(() => buildDraft(values), [values]);

  // Update draft when form values change so user sees template update
  useEffect(() => {
    setDraft(liveDraft);
  }, [
    values.type, values.name, values.district, values.respondent, values.issueDate, 
    values.facts, values.relief, values.courtName, values.caseNumber, values.petitioner,
    values.advocateName, values.enrollmentNumber, values.officeAddress, values.clientAddress, values.place
  ]);

  const onSubmit = async (formValues) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const document = await legalApi.generateDocument(formValues);
      setDraft(document.content_text);
      setSuccess(`Generated document successfully.`);
    } catch (apiError) {
      setError(getApiError(apiError));
      setDraft(liveDraft); // Fallback to local draft
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => alert('Downloading PDF...');
  const handleDownloadDocx = () => alert('Downloading DOCX...');

  const isVakalatnama = values.type === 'Vakalatnama placeholder';

  return (
    <>
      {/* ── Premium Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <FileText className="h-3.5 w-3.5" /> {t('docGen.eyebrow')}
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('docGen.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t('docGen.desc')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel h-fit" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800 text-navy-800 dark:text-legalGold">
                  <FileText className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('docGen.draftFacts')}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('docGen.draftFactsDesc')}</p>
                </div>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormInput label={t('docGen.docType')} name="type" register={register} options={documentTypes} />
                </div>
                
                {isVakalatnama ? (
                  <>
                    <div className="md:col-span-2">
                      <FormInput label="Court Name" name="courtName" register={register} />
                    </div>
                    <FormInput label="Case Number (Optional)" name="caseNumber" register={register} />
                    <FormInput label="Place" name="place" register={register} />
                    <FormInput label="Petitioner / Appellant" name="petitioner" register={register} />
                    <FormInput label="Respondent / Defendant" name="respondent" register={register} />
                    <FormInput label="Advocate Name" name="advocateName" register={register} />
                    <FormInput label="Enrollment Number" name="enrollmentNumber" register={register} />
                    <div className="md:col-span-2">
                      <FormInput label="Advocate Office Address" name="officeAddress" register={register} />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput label="Client Address" name="clientAddress" register={register} />
                    </div>
                    <FormInput label="Date" name="issueDate" register={register} type="date" />
                  </>
                ) : (
                  <>
                    <FormInput label={t('docGen.districtLabel')} name="district" register={register} options={DISTRICT_NAMES} />
                    <FormInput label={t('docGen.dateOfIssue')} name="issueDate" register={register} type="date" />
                    <FormInput label={t('docGen.applicantName')} name="name" register={register} />
                    <FormInput label={t('docGen.oppositeParty')} name="respondent" register={register} />
                    <label className="md:col-span-2 block">
                      <span className="text-sm font-semibold text-navy-900 dark:text-slate-200">{t('docGen.userFacts')}</span>
                      <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 transition-all" {...register('facts')} />
                    </label>
                    <label className="md:col-span-2 block">
                      <span className="text-sm font-semibold text-navy-900 dark:text-slate-200">{t('docGen.requestedRelief')}</span>
                      <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 transition-all" placeholder={t('docGen.reliefPlaceholder')} {...register('relief')} />
                    </label>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 sm:flex-row">

                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-800 dark:bg-legalGold px-6 py-3.5 text-sm font-bold text-white dark:text-navy-900 disabled:opacity-60 transition-all hover:bg-navy-700 dark:hover:bg-yellow-500 hover:shadow-lg" disabled={loading} type="submit">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {loading ? t('docGen.generating') : t('docGen.generateDraft')}
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy-800 dark:border-slate-700 px-6 py-3.5 text-sm font-bold text-navy-800 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-800 transition-all" onClick={() => saveDraft(draft)} type="button">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {t('docGen.saveDraft')}
                </button>
              </div>
              {success ? <p className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-semibold text-aidGreen dark:text-emerald-400">{success}</p> : null}
              {error ? <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-sm font-semibold text-alertRed dark:text-red-400">{error}</p> : null}
              {saved ? <p className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-semibold text-aidGreen dark:text-emerald-400">{t('docGen.draftSaved')}</p> : null}
            </form>

            <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel flex flex-col h-full min-h-[800px]">
              <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('docGen.previewTitle')}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t('docGen.previewDesc')}</p>
                </div>
                <DownloadButtons 
                  onPrint={handlePrint} 
                  onDownloadPdf={handleDownloadPdf} 
                  onDownloadDocx={handleDownloadDocx} 
                  onSave={() => saveDraft(draft)}
                  saved={saved} 
                />
              </div>
              
              <div className="mt-6 flex gap-6 border-b border-slate-200 dark:border-slate-800">
                <button 
                  type="button"
                  className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'editor' ? 'border-legalGold text-navy-900 dark:text-legalGold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'}`}
                  onClick={() => setActiveTab('editor')}
                >
                  Draft Editor
                </button>
                <button 
                  type="button"
                  className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'preview' ? 'border-legalGold text-navy-900 dark:text-legalGold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'}`}
                  onClick={() => setActiveTab('preview')}
                >
                  Print Preview
                </button>
              </div>

              <div className="flex-1 mt-6 flex flex-col min-h-0">
                {activeTab === 'editor' ? (
                  <textarea
                    className="flex-1 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-6 text-sm leading-7 text-slate-700 dark:text-slate-200 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 custom-scrollbar font-mono"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                ) : (
                  <div className="flex-1 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-2">
                    <DocumentPreview content={draft} />
                  </div>
                )}
              </div>
              <p className="mt-6 text-xs leading-5 text-slate-500 dark:text-slate-400 text-center">{t('disclaimer')}</p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
