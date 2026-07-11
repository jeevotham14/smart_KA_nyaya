const toneClasses = {
  navy: 'bg-navy-50 text-navy-800',
  red: 'bg-red-50 text-alertRed',
  gold: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-aidGreen',
};

export default function DashboardCard({ label, value, icon: Icon, tone = 'navy' }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">{value}</p>
        </div>
        <span className={`rounded-sm p-3 ${toneClasses[tone] || toneClasses.navy}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
