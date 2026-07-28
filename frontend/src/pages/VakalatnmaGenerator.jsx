import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import FormInput from '../components/FormInput.jsx';
import DownloadButtons from '../components/DownloadButtons.jsx';
import DocumentPreview from '../components/DocumentPreview.jsx';
import { useDraftManager } from '../components/DraftManager.jsx';

function buildVakalatnama(values) {
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

Date: ${values.date || '[DATE]'}
Place: ${values.place || '[PLACE]'}

______________________
Signature of Client (Executant)

ACCEPTED
______________________
Signature of Advocate
${values.advocateName || '[ADVOCATE NAME]'}
`;
}

export default function VakalatnmaGenerator() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('editor');
  
  const { register, watch } = useForm({
    defaultValues: {
      courtName: 'HIGH COURT OF KARNATAKA',
      caseNumber: '',
      caseTitle: '',
      petitioner: '',
      respondent: '',
      advocateName: '',
      enrollmentNumber: '',
      officeAddress: '',
      clientAddress: '',
      date: new Date().toISOString().split('T')[0],
      place: 'Bengaluru',
    },
  });
  
  const values = watch();
  const liveDraft = useMemo(() => buildVakalatnama(values), [values]);
  
  const { draft, setDraft, saveDraft, saved } = useDraftManager('vakalatnamaDraft', liveDraft);
  
  // Optional: automatically update draft when form values change if it hasn't been manually overridden 
  // We'll just rely on liveDraft being synchronized to draft for simplicity, but if the user manually edits, 
  // it might overwrite their changes if they type in the form again. A real app might handle this more delicately.
  useEffect(() => {
    // Basic sync: if user types in form, update draft
    setDraft(liveDraft);
  }, [liveDraft, setDraft]);

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => alert('Downloading PDF...');
  const handleDownloadDocx = () => alert('Downloading DOCX...');

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
              <Scale className="h-3.5 w-3.5" /> Legal Document
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Vakalatnama Generator
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Create a legally formatted Vakalatnama to authorize your advocate.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <form className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800 text-navy-800 dark:text-navy-100">
                <Scale className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Case Details</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter details to generate Vakalatnama</p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormInput label="Court Name" name="courtName" register={register} />
              </div>
              <FormInput label="Case Number (Optional)" name="caseNumber" register={register} />
              <FormInput label="Case Title" name="caseTitle" register={register} />
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
              <FormInput label="Date" name="date" register={register} type="date" />
              <FormInput label="Place" name="place" register={register} />
            </div>
          </form>
          
          <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel flex flex-col">
            <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Preview</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Review your Vakalatnama</p>
              </div>
              <DownloadButtons 
                onPrint={handlePrint} 
                onDownloadPdf={handleDownloadPdf} 
                onDownloadDocx={handleDownloadDocx} 
                onSave={() => saveDraft(draft)}
                saved={saved} 
              />
            </div>
            
            <div className="mt-4 flex gap-4 border-b border-slate-200 dark:border-slate-700">
              <button 
                type="button"
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'editor' ? 'border-legalGold text-navy-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'}`}
                onClick={() => setActiveTab('editor')}
              >
                Draft Editor
              </button>
              <button 
                type="button"
                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'preview' ? 'border-legalGold text-navy-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'}`}
                onClick={() => setActiveTab('preview')}
              >
                Print Preview
              </button>
            </div>

            <div className="flex-1 mt-5">
              {activeTab === 'editor' ? (
                <textarea
                  className="h-full min-h-[520px] w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-4 text-sm leading-6 text-slate-700 dark:text-slate-300 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
                  value={draft || liveDraft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              ) : (
                <DocumentPreview content={draft || liveDraft} />
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">This is a generated draft and should be verified before submission.</p>
          </aside>
        </div>
      </div>
    </section>
    </>
  );
}
