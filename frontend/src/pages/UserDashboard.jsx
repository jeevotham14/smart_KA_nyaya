import { useTranslation } from 'react-i18next';
import DashboardCard from '../components/DashboardCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { dashboardCards } from '../data/mockData.js';

export default function UserDashboard() {
  const { t } = useTranslation();

  const translatedCards = [
    { ...dashboardCards[0], label: t('dashCards.recentQueries') },
    { ...dashboardCards[1], label: t('dashCards.complaints') },
    { ...dashboardCards[2], label: t('dashCards.generatedDocs') },
    { ...dashboardCards[3], label: t('dashCards.legalAidApps') },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('userDash.eyebrow')} title={t('userDash.title')}>
          {t('userDash.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {translatedCards.map((card) => <DashboardCard key={card.label} {...card} />)}
        </div>
        <div className="mt-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-navy-900">{t('userDash.recentActivity')}</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-100 text-navy-900">
                <tr><th className="p-3">{t('userDash.thType')}</th><th className="p-3">{t('userDash.thSubject')}</th><th className="p-3">{t('userDash.thStatus')}</th><th className="p-3">{t('userDash.thDate')}</th></tr>
              </thead>
              <tbody>
                {[t('userDash.legalQuery'), t('userDash.complaintRequest'), t('userDash.documentDraft'), t('userDash.legalAidApp')].map((type, index) => (
                  <tr className="border-b border-slate-100" key={type}>
                    <td className="p-3 font-semibold">{type}</td><td className="p-3">{t('userDash.subject')}</td><td className="p-3">{t('userDash.statusInProgress')}</td><td className="p-3">Jun {20 + index}, 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
