import { AlertTriangle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AlertBanner({ compact = false }) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const HELPLINES = [
    { number: '112', label: isKn ? '112 - ರಾಷ್ಟ್ರೀಯ ತುರ್ತು' : '112 - Police (National Emergency)', bg: 'bg-white text-alertRed hover:bg-yellow-300' },
    { number: '181', label: isKn ? '181 - ಮಹಿಳಾ ಸಹಾಯವಾಣಿ' : '181 - Women Helpline', bg: 'bg-white/20 text-white hover:bg-white hover:text-alertRed' },
    { number: '1098', label: isKn ? '1098 - ಚೈಲ್ಡ್‌ಲೈನ್' : '1098 - Childline', bg: 'bg-white/20 text-white hover:bg-white hover:text-alertRed' },
  ];

  return (
    <section className={`bg-gradient-to-r from-red-600 via-alertRed to-red-700 text-white shadow-md rounded-2xl ${compact ? 'py-3 px-4' : 'py-4 px-6'} transition-all`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-extrabold tracking-wide">{t('alert.emergency')}</p>
            <p className="text-xs text-red-100 font-medium">
              {isKn ? 'ತಕ್ಷಣದ ಕರೆ ಮಾಡಲು ಬಟನ್‌ಗಳ ಮೇಲೆ ಸ್ಪರ್ಶಿಸಿ' : 'Tap any number below to call directly from your device'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {HELPLINES.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className={`inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-xs sm:text-sm font-black shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${item.bg}`}
              title={`Call ${item.number} directly`}
            >
              <Phone className="h-4 w-4 shrink-0 animate-bounce" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
