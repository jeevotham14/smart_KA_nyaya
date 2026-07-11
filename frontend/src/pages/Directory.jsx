import { useEffect, useState } from 'react';
import { MapPinned } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { districts, taluks } from '../data/mockData.js';
import { getApiError, legalApi } from '../services/api.js';

function formatServiceType(value) {
  return value ? value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Service';
}

export default function Directory() {
  const { t } = useTranslation();
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filters = [t('directory.filterLegalAid'), t('directory.filterDLSA'), t('directory.filterHelpline'), t('directory.filterCourt'), t('directory.filterPolice'), t('directory.filterWomenPolice'), t('directory.filterNGO'), t('directory.filterShelter')];

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
    loadDirectory();
    return () => {
      active = false;
    };
  }, [district, taluk, type, query]);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('directory.eyebrow')} title={t('directory.title')}>
          {t('directory.desc')}
        </SectionHeader>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4">
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.keyword')}</span>
                <input className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm" placeholder={t('directory.searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.district')}</span>
                <select className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm" value={district} onChange={(event) => setDistrict(event.target.value)}>
                  <option value="">{t('directory.allDistricts')}</option>
                  {districts.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.taluk')}</span>
                <select className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm" value={taluk} onChange={(event) => setTaluk(event.target.value)}>
                  <option value="">{t('directory.allTaluks')}</option>
                  {taluks.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-semibold text-navy-900">{t('directory.serviceFilter')}</span>
                <select className="mt-2 w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
                  <option value="">{t('directory.allServices')}</option>
                  {filters.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </aside>
          <div className="grid gap-6">
            <div className="min-h-72 rounded-md border border-dashed border-slate-300 bg-slate-100 p-6">
              <MapPinned className="h-8 w-8 text-legalGold" aria-hidden="true" />
              <p className="mt-4 font-serif text-2xl font-bold text-navy-900">{t('directory.mapPlaceholder')}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('directory.mapDesc')}</p>
            </div>
            <div className="grid gap-3">
              {loading ? <p className="rounded-sm bg-navy-50 p-4 text-sm font-semibold text-navy-900">{t('directory.loading')}</p> : null}
              {error ? <p className="rounded-sm bg-red-50 p-4 text-sm font-semibold text-alertRed">{error}</p> : null}
              {!loading && !error && results.length === 0 ? <p className="rounded-sm bg-slate-50 p-4 text-sm text-slate-600">{t('directory.noResults')}</p> : null}
              {results.map((item) => (
                <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" key={item.service_id}>
                  <p className="font-serif text-xl font-bold text-navy-900">{item.name}</p>
                  <p className="mt-2 text-sm text-slate-600">{formatServiceType(item.service_type)} - {item.district}{item.taluk ? `, ${item.taluk}` : ''}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.address}</p>
                  {item.phone ? <p className="mt-2 text-sm font-semibold text-navy-800">{item.phone}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
