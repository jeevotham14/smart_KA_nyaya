import { useTranslation } from 'react-i18next';

export default function FormInput({ label, name, register, type = 'text', options, error, ...props }) {
  const { t } = useTranslation();

  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-900">{label}</span>
      {options ? (
        <select
          className="mt-2 w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
          {...register(name)}
          {...props}
        >
          <option value="">{t('docGen.select')}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="mt-2 w-full rounded-sm border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-legalGold focus:ring-2 focus:ring-legalGold/20"
          {...register(name)}
          {...props}
        />
      )}
      {error ? <span className="mt-1 block text-xs font-medium text-alertRed">{error.message}</span> : null}
    </label>
  );
}
