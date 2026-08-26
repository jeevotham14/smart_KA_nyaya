import { useState, useEffect } from 'react';
import { FileWarning, MapPin, Phone, ShieldAlert, Shield, Navigation, Compass, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { karnatakaDistricts } from '../data/karnatakaDistricts.js';
import { legalApi } from '../services/api.js';
import { detectDistrict, haversineKm } from '../utils/geolocation.js';

const DISTRICT_NAMES = Object.keys(karnatakaDistricts).sort();

export default function WomenProtection() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle, locating, success, denied
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const guidance = [
    { title: t('women.guidance1Title'), text: t('women.guidance1Text') },
    { title: t('women.guidance2Title'), text: t('women.guidance2Text') },
    { title: t('women.guidance3Title'), text: t('women.guidance3Text') },
    { title: t('women.guidance4Title'), text: t('women.guidance4Text') },
  ];
  const actionChecklist = [t('women.check1'), t('women.check2'), t('women.check3'), t('women.check4'), t('women.check5')];

  // Auto-detect geolocation on mount
  useEffect(() => {
    let isMounted = true;
    async function runGeo() {
      setGeoStatus('locating');
      const { district, lat, lon } = await detectDistrict();
      if (!isMounted) return;
      if (lat && lon) setUserCoords({ lat, lon });
      if (district) {
        setSelectedDistrict(district);
        setGeoStatus('success');
      } else {
        setGeoStatus('denied');
      }
    }
    runGeo();
    return () => { isMounted = false; };
  }, []);

  // Fetch centers & sort by distance if coords exist
  useEffect(() => {
    let active = true;
    async function loadCenters() {
      setLoadingCenters(true);
      try {
        const data = await legalApi.searchDirectory({ serviceType: 'women_police_station', district: selectedDistrict });
        if (active) {
          let list = [...data];
          if (userCoords && userCoords.lat && userCoords.lon) {
            list = list.map((item) => {
              const itemLat = item.latitude || 12.9716;
              const itemLon = item.longitude || 77.5946;
              const dist = haversineKm(userCoords.lat, userCoords.lon, itemLat, itemLon);
              return { ...item, distanceKm: dist };
            }).sort((a, b) => a.distanceKm - b.distanceKm);
          }
          setFilteredCenters(list);
        }
      } catch (err) {
        console.error(err);
        if (active) setFilteredCenters([]);
      } finally {
        if (active) setLoadingCenters(false);
      }
    }
    loadCenters();
    return () => { active = false; };
  }, [selectedDistrict, userCoords]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-alertRed/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-alertRed/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-alertRed/30 bg-alertRed/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              <Shield className="h-3.5 w-3.5" /> {t('women.eyebrow')}
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('women.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t('women.desc')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Emergency Speed Dial Header */}
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="rounded-2xl border border-red-200/50 bg-red-50/80 dark:bg-red-950/20 dark:border-red-900/50 p-6 backdrop-blur-sm shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-alertRed">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-alertRed dark:text-red-400">{t('women.getHelpNow')}</h3>
                  <p className="mt-2 text-sm leading-6 text-red-900 dark:text-red-200">{t('women.getHelpDesc')}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: t('women.btn112'), number: '112' },
                  { label: t('women.btn181'), number: '181' },
                  { label: t('women.btn1098'), number: '1098' },
                ].map((item) => (
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-alertRed px-4 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-alertRed/20 transition-all duration-300"
                    href={`tel:${item.number}`}
                    key={item.number}
                    aria-label={`Call ${item.label}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            
            <aside className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 shadow-sm glass-panel">
              <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{t('women.checklist')}</h3>
              <ul className="mt-4 space-y-3">
                {actionChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-legalGold/20 text-legalGold text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {/* Directory Lookup & Nearby Centers */}
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-legalGold" />
                  {isKn ? 'ಹತ್ತಿರದ ಮಹಿಳಾ ಪೊಲೀಸ್ ಠಾಣೆಗಳು & ಸಖಿ ಕೇಂದ್ರಗಳು' : 'Nearby Women Protection Stations & Sakhi Centres'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {geoStatus === 'success'
                    ? (isKn ? 'ನಿಮ್ಮ ಜಿಯೋ-ಸ್ಥಳದಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲಾಗಿದೆ.' : 'Auto-detected from your live location.')
                    : (isKn ? 'ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ಸ್ಥಳೀಯ ನೆರವು ಹುಡುಕಿ.' : 'Select a district to view local support centres.')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-2.5 text-sm font-semibold text-navy-900 dark:text-white focus:border-legalGold"
                >
                  <option value="">{isKn ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು (All Districts)' : 'All Districts'}</option>
                  {DISTRICT_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingCenters ? (
              <p className="text-sm text-slate-500 py-8 text-center">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading nearby safety centres...'}</p>
            ) : filteredCenters.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCenters.map((center) => (
                  <div key={center.service_id || center.name} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-navy-950/50 hover:border-legalGold transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-navy-900 dark:text-white text-base">{center.name}</h4>
                      {center.distanceKm && (
                        <span className="text-xs font-bold text-legalGold bg-legalGold/10 px-2 py-0.5 rounded">
                          {center.distanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{center.address}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">{center.district}, Karnataka</p>

                    <div className="mt-4 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                      {center.phone && (
                        <a
                          href={`tel:${center.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{isKn ? 'ಕರೆ ಮಾಡಿ' : 'Call Speed Dial'}</span>
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-200 dark:bg-navy-800 hover:bg-legalGold hover:text-navy-950 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                        title="Get Directions"
                      >
                        <Compass className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">
                {isKn ? 'ಈ ಜಿಲ್ಲೆಯಲ್ಲಿ ಯಾವುದೇ ಕೇಂದ್ರ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No registered centres found for this district.'}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
