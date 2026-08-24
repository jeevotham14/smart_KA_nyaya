import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Scale, Phone, Video, Calendar, Star, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { advocateApi, getApiError } from '../services/api.js';

export default function Advocates() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    specialization: '',
    district: '',
    language: '',
    mode: '',
    pro_bono: false,
  });

  const fetchAdvocates = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.specialization) params.specialization = filters.specialization;
      if (filters.district) params.district = filters.district;
      if (filters.language) params.language = filters.language;
      if (filters.mode) params.mode = filters.mode;
      if (filters.pro_bono) params.pro_bono = true;
      
      const data = await advocateApi.getAdvocates(params);
      setAdvocates(data || []);
    } catch (err) {
      setError("Unable to connect to the advocate service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvocates();
  }, [filters]);

  return (
    <>
      <section className="bg-navy-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-display font-extrabold text-white">Consult a Legal Professional</h1>
          <p className="mt-3 text-slate-300">Find advocates based on your legal needs and request a consultation.</p>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-navy-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-navy-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-navy-900 dark:text-white mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Specialization</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-2 text-sm text-navy-900 dark:text-white"
                    value={filters.specialization}
                    onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                  >
                    <option value="">Any</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Property Law">Property Law</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">District</label>
                  <input 
                    type="text"
                    placeholder="e.g. Bengaluru"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-2 text-sm text-navy-900 dark:text-white"
                    value={filters.district}
                    onChange={(e) => setFilters({...filters, district: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Language</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-2 text-sm text-navy-900 dark:text-white"
                    value={filters.language}
                    onChange={(e) => setFilters({...filters, language: e.target.value})}
                  >
                    <option value="">Any</option>
                    <option value="Kannada">Kannada</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Consultation Mode</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-2 text-sm text-navy-900 dark:text-white"
                    value={filters.mode}
                    onChange={(e) => setFilters({...filters, mode: e.target.value})}
                  >
                    <option value="">Any</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox"
                    id="pro_bono"
                    checked={filters.pro_bono}
                    onChange={(e) => setFilters({...filters, pro_bono: e.target.checked})}
                    className="rounded border-slate-300 text-legalGold focus:ring-legalGold"
                  />
                  <label htmlFor="pro_bono" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Pro-Bono / Legal Aid Only
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 flex gap-3 text-sm text-alertRed border border-red-200">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-legalGold" />
              </div>
            ) : (!error && advocates.length === 0) ? (
              <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400">No advocates found matching your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {advocates.map((adv) => (
                  <div key={adv.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                          {adv.full_name}
                          {adv.verification_status === 'VERIFIED' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </h3>
                        <p className="text-xs text-slate-500">{adv.years_of_experience} years experience</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400"/> {adv.district}{adv.city ? `, ${adv.city}` : ''}</p>
                      <p className="flex items-center gap-2"><Scale className="h-4 w-4 shrink-0 text-slate-400"/> {adv.specializations?.join(', ') || 'General'}</p>
                      <p className="flex items-center gap-2"><span className="h-4 w-4 flex items-center justify-center shrink-0 font-bold text-slate-400">₹</span> ₹{adv.consultation_fee} / session</p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {adv.online_consultation && <span className="text-xs px-2 py-1 bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-full border border-sky-100 dark:border-sky-800">Online</span>}
                        {adv.offline_consultation && <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">Offline</span>}
                        {adv.pro_bono_available && <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800">Pro-Bono</span>}
                      </div>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link to={`/advocates/${adv.id}`} className="premium-btn premium-btn-gold w-full text-center py-2 text-xs">
                        View Profile & Availability
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
