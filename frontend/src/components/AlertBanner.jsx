import { AlertTriangle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AlertBanner({ compact = false }) {
  const { t } = useTranslation();

  return (
    <section className={`bg-alertRed text-white ${compact ? 'py-3' : 'py-4'}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">{t('alert.emergency')}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          {[t('alert.btn112'), t('alert.btn181'), t('alert.btn1098')].map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-sm border border-white/35 px-3 py-1">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
