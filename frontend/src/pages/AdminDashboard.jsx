import { useTranslation } from 'react-i18next';
import DashboardCard from '../components/DashboardCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { adminStats } from '../data/mockData.js';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const translatedStats = [
    { ...adminStats[0], label: t('adminCards.registeredUsers') },
    { ...adminStats[1], label: t('adminCards.openComplaints') },
    { ...adminStats[2], label: t('adminCards.directoryEntries') },
    { ...adminStats[3], label: t('adminCards.legalAidCases') },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('adminDash.eyebrow')} title={t('adminDash.title')}>
          {t('adminDash.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {translatedStats.map((card) => <DashboardCard key={card.label} {...card} />)}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-navy-900">{t('adminDash.manage')}</h3>
            <div className="mt-5 grid gap-3">
              {[t('adminDash.users'), t('adminDash.legalContent'), t('adminDash.directoryServices'), t('adminDash.complaints'), t('adminDash.analyticsReports')].map((item) => (
                <button className="rounded-sm border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:border-legalGold" key={item} type="button">{item}</button>
              ))}
            </div>
          </aside>
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-navy-900">{t('adminDash.reportsTable')}</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-100 text-navy-900">
                  <tr><th className="p-3">{t('adminDash.thReport')}</th><th className="p-3">{t('adminDash.thDistrict')}</th><th className="p-3">{t('adminDash.thOwner')}</th><th className="p-3">{t('adminDash.thStatus')}</th></tr>
                </thead>
                <tbody>
                  {[t('adminDash.report1'), t('adminDash.report2'), t('adminDash.report3'), t('adminDash.report4')].map((report) => (
                    <tr className="border-b border-slate-100" key={report}>
                      <td className="p-3 font-semibold">{report}</td><td className="p-3">{t('adminDash.statewide')}</td><td className="p-3">{t('adminDash.adminDesk')}</td><td className="p-3">{t('adminDash.open')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
