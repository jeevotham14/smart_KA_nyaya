import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServiceCard({ title, description, icon: Icon, path }) {
  const { t } = useTranslation();

  return (
    <Link
      to={path}
      className="group flex h-full flex-col rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-legalGold hover:shadow-legal"
    >
      <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-navy-50 text-navy-800">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="font-serif text-xl font-bold text-navy-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy-800">
        {t('services.openService')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}