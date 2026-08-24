import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, MapPinned, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';
import { detectDistrict } from '../utils/geolocation.js';

export const DISTRICT_NAMES_KN = {
  'Bagalkote': 'ಬಾಗಲಕೋಟೆ',
  'Ballari': 'ಬಳ್ಳಾರಿ',
  'Belagavi': 'ಬೆಳಗಾವಿ',
  'Bengaluru Rural': 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
  'Bengaluru Urban': 'ಬೆಂಗಳೂರು ನಗರ',
  'Bidar': 'ಬೀದರ್',
  'Chamarajanagara': 'ಚಾಮರಾಜನಗರ',
  'Chikkaballapura': 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ',
  'Chikkamagaluru': 'ಚಿಕ್ಕಮಗಳೂರು',
  'Chitradurga': 'ಚಿತ್ರದುರ್ಗ',
  'Dakshina Kannada': 'ದಕ್ಷಿಣ ಕನ್ನಡ',
  'Davangere': 'ದಾವಣಗೆರೆ',
  'Dharwad': 'ಧಾರವಾಡ',
  'Gadag': 'ಗದಗ',
  'Hassan': 'ಹಾಸನ',
  'Haveri': 'ಹಾವೇರಿ',
  'Kalaburagi': 'ಕಲಬುರಗಿ',
  'Kodagu': 'ಕೊಡಗು',
  'Kolar': 'ಕೋಲಾರ',
  'Koppal': 'ಕೊಪ್ಪಳ',
  'Mandya': 'ಮಂಡ್ಯ',
  'Mysuru': 'ಮೈಸೂರು',
  'Raichur': 'ರಾಯಚೂರು',
  'Ramanagara': 'ರಾಮನಗರ',
  'Shivamogga': 'ಶಿವಮೊಗ್ಗ',
  'Tumakuru': 'ತುಮಕೂರು',
  'Udupi': 'ಉಡುಪಿ',
  'Uttara Kannada': 'ಉತ್ತರ ಕನ್ನಡ',
  'Vijayapura': 'ವಿಜಯಪುರ',
  'Yadgir': 'ಯಾದಗಿರಿ',
  'Vijayanagara': 'ವಿಜಯನಗರ',
};

function formatServiceType(value, isKn) {
  if (!value) return isKn ? 'ಸೇವೆ' : 'Service';
  const strValue = String(value);
  if (isKn) {
    switch (strValue) {
      case 'legal_aid': return 'ಉಚಿತ ಕಾನೂನು ನೆರವು';
      case 'dlsa': return 'ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ (DLSA)';
      case 'helpline': return 'ಸಹಾಯವಾಣಿ ಕೇಂದ್ರ';
      case 'court': return 'ನ್ಯಾಯಾಲಯ';
      case 'police': return 'ಪೊಲೀಸ್ ಠಾಣೆ';
      case 'women_police_station': return 'ಮಹಿಳಾ ಪೊಲೀಸ್ ಠಾಣೆ';
      case 'ngo': return 'ಎನ್‌ಜಿಒ / ಸ್ವಯಂಸೇವಾ ಸಂಸ್ಥೆ';
      case 'one_stop_centre': return 'ಒನ್ ಸ್ಟಾಪ್ ಸೆಂಟರ್ (ಸಖಿ)';
      default: return strValue.replace(/_/g, ' ');
    }
  }
  return strValue.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function translateLocationName(name, isKn) {
  if (!isKn || !name) return name;
  return name
    .replace('Bengaluru Urban DLSA', 'ಬೆಂಗಳೂರು ನಗರ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರ')
    .replace('Mysuru District Court', 'ಮೈಸೂರು ಜಿಲ್ಲಾ ಮತ್ತು ಸತ್ರ ನ್ಯಾಯಾಲಯ')
    .replace('Women Police Station, Hubballi', 'ಮಹಿಳಾ ಪೊಲೀಸ್ ಠಾಣೆ, ಹುಬ್ಬಳ್ಳಿ')
    .replace('Legal Aid Clinic, Kalaburagi', 'ಉಚಿತ ಕಾನೂನು ನೆರವು ಚಿಕಿತ್ಸಾಲಯ, ಕಲಬುರಗಿ')
    .replace('Court', 'ನ್ಯಾಯಾಲಯ')
    .replace('Police Station', 'ಪೊಲೀಸ್ ಠಾಣೆ')
    .replace('District Court', 'ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯ');
}

function translateAddress(address, isKn) {
  if (!isKn || !address) return address;
  return address
    .replace('District Court Complex', 'ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯ ಸಂಕೀರ್ಣ')
    .replace('Bengaluru', 'ಬೆಂಗಳೂರು')
    .replace('Mysuru', 'ಮೈಸೂರು')
    .replace('Hubballi', 'ಹುಬ್ಬಳ್ಳಿ')
    .replace('Kalaburagi', 'ಕಲಬುರಗಿ')
    .replace('Karnataka', 'ಕರ್ನಾಟಕ');
}

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function Directory() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  
  const [availableTaluks, setAvailableTaluks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SERVICE_FILTERS = [
    { value: 'legal_aid',            label: t('directory.filterLegalAid') },
    { value: 'dlsa',                 label: t('directory.filterDLSA') },
    { value: 'helpline',             label: t('directory.filterHelpline') },
    { value: 'court',                label: t('directory.filterCourt') },
    { value: 'police',               label: t('directory.filterPolice') },
    { value: 'women_police_station', label: t('directory.filterWomenPolice') },
    { value: 'ngo',                  label: t('directory.filterNGO') },
    { value: 'one_stop_centre',      label: isKn ? 'ಒನ್ ಸ್ಟಾಪ್ ಸೆಂಟರ್ (ಸಖಿ)' : 'One Stop Centre (Sakhi)' },
  ];

  useEffect(() => {
    let active = true;
    async function runGeo() {
      const { district: autoDistrict } = await detectDistrict();
      if (active && autoDistrict && !district) {
        setDistrict(autoDistrict);
      }
    }
    runGeo();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (district && karnatakaDistricts[district]) {
      setAvailableTaluks([...karnatakaDistricts[district]].sort());
    } else {
      setAvailableTaluks([]);
    }
    setTaluk('');
  }, [district]);

  useEffect(() => {
    let active = true;
    async function loadDirectory() {
      setLoading(true);
      setError('');
      try {
        const data = await legalApi.searchDirectory({ district, taluk, serviceType: type, q: query });
        if (active) setResults(Array.isArray(data) ? data : []);
      } catch (apiError) {
        if (active) {
          setError(getApiError(apiError));
          setResults([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      loadDirectory();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [district, taluk, type, query]);

  // Determine map search query in Kannada or English
  const rawMapTerm = query.trim() || taluk || district || 'Karnataka, India';
  const mapSearchTerm = isKn && DISTRICT_NAMES_KN[rawMapTerm] ? DISTRICT_NAMES_KN[rawMapTerm] + ', ಕರ್ನಾಟಕ, ಭಾರತ' : rawMapTerm + (rawMapTerm === 'Karnataka, India' ? '' : ', Karnataka, India');

  const inputClassName = "mt-2 w-full rounded-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold transition-colors";
  
  return (
    <>
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center animate-scale-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
            <Search className="h-3.5 w-3.5" /> {t('directory.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t('directory.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {t('directory.desc')}
          </p>
        </div>
      </section>

      <section className="bg-surface dark:bg-navy-950 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            
            {/* Sidebar / Filters */}
            <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel content-start">
              <div className="grid gap-4">
                <label>
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('directory.keyword')}</span>
                  <input 
                    className={inputClassName}
                    placeholder={isKn ? "ಉದಾ: ಬೆಂಗಳೂರು, ಹುಬ್ಬಳ್ಳಿ, ಅಥವಾ ನ್ಯಾಯಾಲಯದ ಹೆಸರು" : "e.g. Bengaluru, Hubballi, or Court name"} 
                    value={query} 
                    onChange={(event) => setQuery(event.target.value)} 
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('directory.district')}</span>
                  <select 
                    className={inputClassName}
                    value={district} 
                    onChange={(event) => setDistrict(event.target.value)}
                  >
                    <option value="">{t('directory.allDistricts')}</option>
                    {DISTRICT_NAMES.map((item) => (
                      <option key={item} value={item}>
                        {isKn && DISTRICT_NAMES_KN[item] ? DISTRICT_NAMES_KN[item] : item}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('directory.taluk')}</span>
                  <select 
                    className={`${inputClassName} disabled:opacity-50`}
                    value={taluk} 
                    onChange={(event) => setTaluk(event.target.value)}
                    disabled={availableTaluks.length === 0}
                  >
                    <option value="">{t('directory.allTaluks')}</option>
                    {availableTaluks.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-semibold text-navy-900 dark:text-white">{t('directory.serviceFilter')}</span>
                  <select 
                    className={inputClassName}
                    value={type} 
                    onChange={(event) => setType(event.target.value)}
                  >
                    <option value="">{t('directory.allServices')}</option>
                    {SERVICE_FILTERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              </div>
            </aside>

            {/* Results and Map */}
            <div className="grid gap-6 content-start">
              
              {/* Embedded Google Map */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-navy-900 shadow-sm relative h-72">
                <iframe
                  title={isKn ? "ಗೂಗಲ್ ನಕ್ಷೆ (ಕರ್ನಾಟಕ ಸ್ಥಳ)" : "Google Map"}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchTerm)}&t=&z=7&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>

              {/* Results List */}
              <div className="grid gap-4">
                {loading ? <p className="rounded-xl bg-navy-50 dark:bg-navy-800 p-4 text-sm font-semibold text-navy-900 dark:text-white">{t('directory.loading')}</p> : null}
                {error ? <p className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 text-sm font-semibold text-alertRed dark:text-red-400">{error}</p> : null}
                {!loading && !error && results.length === 0 ? <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 p-4 text-sm text-slate-600 dark:text-slate-400">{t('directory.noResults')}</p> : null}
                
                {results.map((item) => {
                  const nameDisplay = translateLocationName(item.name, isKn);
                  const distDisplay = isKn && DISTRICT_NAMES_KN[item.district] ? DISTRICT_NAMES_KN[item.district] : item.district;
                  const addressDisplay = translateAddress(item.address, isKn);

                  return (
                    <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-legalGold dark:hover:border-legalGold" key={item.service_id}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-serif text-xl font-bold text-navy-900 dark:text-white">{nameDisplay}</p>
                          <p className="mt-1 text-sm font-medium text-legalGold">{formatServiceType(item.service_type, isKn)} • {distDisplay}{item.taluk ? `, ${item.taluk}` : ''}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid gap-2">
                        <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                          <span>{addressDisplay}</span>
                        </p>
                      </div>
                      
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        {item.phone && (
                          <a 
                            href={`tel:${item.phone}`} 
                            className="premium-btn premium-btn-gold text-xs px-4 py-2"
                          >
                            {isKn ? 'ಕರೆ ಮಾಡಿ: ' : 'Call: '}{item.phone}
                          </a>
                        )}
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + item.address)}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="premium-btn premium-btn-secondary !text-navy-900 dark:!text-white text-xs px-4 py-2"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> {isKn ? 'ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ' : 'View on Map'}
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
