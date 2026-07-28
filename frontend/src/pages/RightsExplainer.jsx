import { useState } from 'react';
import { BookOpen, Shield, Scale, FileText, Clock, AlertTriangle } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { legalApi } from '../services/api.js';

const CATEGORIES = [
  'Consumer Rights',
  'Tenant Rights',
  'Employee Rights',
  'Women’s Rights',
  'Right to Information (RTI)',
  'Cybercrime Victims',
  'Domestic Violence',
  'Property Rights',
  'Arrest Rights',
  'Maternity Benefits',
  'Senior Citizen Rights',
  'Motor Vehicle Accidents'
];

export default function RightsExplainer() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRights = async (category) => {
    if (!category) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await legalApi.explainRights({ category, language: 'English' });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch rights information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (val) {
      fetchRights(val);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 mb-4">
              <BookOpen className="h-8 w-8 text-legalGold" />
            </div>
            <SectionHeader title="Know Your Rights">
              Select a category to learn about your legal rights, applicable laws, and procedures.
            </SectionHeader>
          </div>
          
          <div className="max-w-xl mx-auto mb-10">
            <label className="block text-sm font-medium text-navy-900 mb-2 text-center">Select Legal Category</label>
            <select 
              value={selectedCategory}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
            >
              <option value="">-- Choose a Category --</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-legalGold border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-slate-500 font-medium">Compiling legal information...</p>
            </div>
          )}

          {error && <div className="text-center text-alertRed bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>}

          {result && !loading && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <Shield className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Your Rights</h3>
                </div>
                <ul className="space-y-2 text-slate-600 list-disc list-outside pl-4">
                  {result.rights?.map((r, i) => <li key={i}>{r}</li>) || <li>No specific rights listed.</li>}
                </ul>
              </div>

              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <Scale className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Applicable Law</h3>
                </div>
                <ul className="space-y-2 text-slate-600 list-disc list-outside pl-4">
                  {result.laws?.map((l, i) => <li key={i}>{l}</li>) || <li>Not specified.</li>}
                </ul>
              </div>

              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <FileText className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Required Documents</h3>
                </div>
                <ul className="space-y-2 text-slate-600 list-disc list-outside pl-4">
                  {result.documents?.map((d, i) => <li key={i}>{d}</li>) || <li>Not specified.</li>}
                </ul>
              </div>

              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Authority to Approach</h3>
                </div>
                <p className="text-slate-600">{result.authority || 'Not specified.'}</p>
              </div>

              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <Clock className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Time Limits & Process</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-600">
                    <strong className="text-navy-900 block mb-1">Time Limit:</strong> 
                    {result.timeLimit || 'Not specified.'}
                  </p>
                  <p className="text-slate-600">
                    <strong className="text-navy-900 block mb-1">Estimated Process:</strong> 
                    {result.process || 'Not specified.'}
                  </p>
                </div>
              </div>

              <div className="card-premium p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-legalGold/10 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-legalGold" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy-900">Possible Outcomes</h3>
                </div>
                <ul className="space-y-2 text-slate-600 list-disc list-outside pl-4">
                  {result.outcomes?.map((o, i) => <li key={i}>{o}</li>) || <li>Not specified.</li>}
                </ul>
              </div>
            </div>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
