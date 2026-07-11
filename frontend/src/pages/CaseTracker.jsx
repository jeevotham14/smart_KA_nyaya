import { useState } from 'react';
import { Bell, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { getApiError, legalApi } from '../services/api.js';

export default function CaseTracker() {
  const [trackingId, setTrackingId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const lookup = async (event) => {
    event.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');
    setCaseData(null);
    try {
      setCaseData(await legalApi.trackCase(trackingId.trim()));
    } catch (apiError) {
      setError(getApiError(apiError));
    } finally {
      setLoading(false);
    }
  };

  const timeline = [t('caseTracker.timelineStep1'), t('caseTracker.timelineStep2'), t('caseTracker.timelineStep3'), t('caseTracker.timelineStep4')];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('caseTracker.eyebrow')} title={t('caseTracker.title')}>
          {t('caseTracker.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form className="rounded-md border border-slate-200 bg-white p-6 shadow-sm" onSubmit={lookup}>
            <label>
              <span className="text-sm font-semibold text-navy-900">{t('caseTracker.caseId')}</span>
              <input className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm" placeholder={t('caseTracker.placeholder')} value={trackingId} onChange={(event) => setTrackingId(event.target.value)} />
            </label>
            <button className="mt-4 rounded-sm bg-navy-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={loading} type="submit">
              {loading ? t('caseTracker.checking') : t('caseTracker.checkStatus')}
            </button>
            {error ? <p className="mt-4 rounded-sm bg-red-50 p-4 text-sm font-semibold text-alertRed">{error}</p> : null}
            {caseData ? (
              <div className="mt-4 rounded-sm bg-navy-50 p-4 text-sm leading-6 text-navy-900">
                <p className="font-bold">{t('caseTracker.status')}: {caseData.status}</p>
                <p>{t('caseTracker.caseIdLabel')}: {caseData.case_id}</p>
                {caseData.court_type ? <p>{t('caseTracker.courtType')}: {caseData.court_type}</p> : null}
                {caseData.estimated_duration_days ? <p>{t('caseTracker.estimatedDuration')}: {caseData.estimated_duration_days} {t('caseTracker.days')}</p> : null}
              </div>
            ) : null}
          </form>
          <div className="grid gap-6">
            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-navy-900">{t('caseTracker.statusTimeline')}</h3>
              <div className="mt-5 grid gap-5">
                {timeline.map((item, index) => (
                  <div className="timeline-line relative flex gap-3 last:before:hidden" key={item}>
                    <span className={`relative z-10 mt-1 h-6 w-6 rounded-full border-2 ${caseData && index < 3 ? 'border-aidGreen bg-aidGreen' : 'border-slate-300 bg-white'}`} />
                    <p className="text-sm font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <FileText className="h-6 w-6 text-legalGold" />
                <p className="mt-3 font-bold text-navy-900">{t('caseTracker.uploadedDocs')}</p>
                <p className="mt-2 text-sm text-slate-600">{caseData?.documents?.length ? `${caseData.documents.length} ${t('caseTracker.docRecords')}` : t('caseTracker.noDocRecords')}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <Bell className="h-6 w-6 text-legalGold" />
                <p className="mt-3 font-bold text-navy-900">{t('caseTracker.notifications')}</p>
                <p className="mt-2 text-sm text-slate-600">{t('caseTracker.notifDesc')}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
