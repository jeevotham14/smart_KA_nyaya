import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, MapPinned } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { karnatakaDistricts } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

function formatServiceType(value) {
  return value ? value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Service';
}

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function Directory() {
  const { t } = useTranslation();
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  
  const [availableTaluks, setAvailableTaluks] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filters = [
    t('directory.filterLegalAid'), 
    t('directory.filterDLSA'), 
    t('directory.filterHelpline'), 
    t('directory.filterCourt'), 
    t('directory.filterPolice'), 
    t('directory.filterWomenPolice'), 
    t('directory.filterNGO'), 
    t('directory.filterShelter')
  ];

  // Update dependent taluks dropdown when district changes
  useEffect(() => {
    if (district && karnatakaDistricts[district]) {
      setAvailableTaluks([...karnatakaDistricts[district]].sort());
    } else {
      setAvailableTaluks([]);
    }
    setTaluk(''); // reset taluk when district changes
  }, [district]);

  useEffect(() => {
    let active = true;
    async function loadDirectory() {
      setLoading(true);
      setError('');
      try {
        const data = await legalApi.searchDirectory({ district, taluk, serviceType: type, q: query });
        if (active) setResults(data);
      } catch (apiError) {
        if (active) {
          setError(getApiError(apiError));
          setResults([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    // Simple debounce to avoid spamming the backend while typing
    const timer = setTimeout(() => {
      loadDirectory();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [district, taluk, type, query]);

  // Determine what the map should show
  const mapSearchTerm = query.trim() || taluk || district || 'Karnataka, India';

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('directory.eyebrow')} title={t('directory.title')}>
          {t('directory.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          
          {/* Sidebar / Filters */}
          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm content-start">
            <div className="grid gap-4">
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.keyword')}</span>
                <input 
                  className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold" 
                  placeholder="e.g. Bengaluru, Hubballi, or Court name" 
                  value={query} 
                  onChange={(event) => setQuery(event.target.value)} 
                />
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.district')}</span>
                <select 
                  className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold" 
                  value={district} 
                  onChange={(event) => setDistrict(event.target.value)}
                >
                  <option value="">{t('directory.allDistricts')}</option>
                  {DISTRICT_NAMES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.taluk')}</span>
                <select 
                  className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold disabled:bg-slate-50 disabled:text-slate-400" 
                  value={taluk} 
                  onChange={(event) => setTaluk(event.target.value)}
                  disabled={availableTaluks.length === 0}
                >
                  <option value="">{t('directory.allTaluks')}</option>
                  {availableTaluks.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.serviceFilter')}</span>
                <select 
                  className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-legalGold focus:ring-1 focus:ring-legalGold" 
                  value={type} 
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="">{t('directory.allServices')}</option>
                  {filters.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </aside>

          {/* Results and Map */}
          <div className="grid gap-6 content-start">
            
            {/* Embedded Google Map */}
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm relative h-72">
              <iframe
                title="Google Map"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchTerm + (mapSearchTerm === 'Karnataka, India' ? '' : ', Karnataka, India'))}&t=&z=7&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>

            {/* Results List */}
            <div className="grid gap-3">
              {loading ? <p className="rounded-sm bg-navy-50 p-4 text-sm font-semibold text-navy-900">{t('directory.loading')}</p> : null}
              {error ? <p className="rounded-sm bg-red-50 p-4 text-sm font-semibold text-alertRed">{error}</p> : null}
              {!loading && !error && results.length === 0 ? <p className="rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{t('directory.noResults')}</p> : null}
              
              {results.map((item) => (
                <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm hover:border-legalGold transition-colors" key={item.service_id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl font-bold text-navy-900">{item.name}</p>
                      <p className="mt-1 text-sm font-medium text-legalGold">{formatServiceType(item.service_type)} • {item.district}{item.taluk ? `, ${item.taluk}` : ''}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid gap-2">
                    <p className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item.address}</span>
                    </p>
                  </div>
                  
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {item.phone && (
                      <a 
                        href={`tel:${item.phone}`} 
                        className="inline-flex items-center justify-center rounded-sm bg-navy-800 px-4 py-2 text-xs font-bold text-white hover:bg-navy-700 transition-colors"
                      >
                        Call: {item.phone}
                      </a>
                    )}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + item.address)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View on Map
                    </a>
                  </div>
                </article>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
