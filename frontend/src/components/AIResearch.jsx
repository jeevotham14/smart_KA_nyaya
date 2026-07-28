import React, { useState } from 'react';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function AIResearch({ contextText }) {
  const [precedents, setPrecedents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRetrieve = async () => {
    if (!contextText) {
      setError("No context provided for research.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/ai/retrieve-precedents', { query: contextText });
      setPrecedents(data.precedents || data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve precedents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-navy-800/50 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-white">
          <BookOpen className="h-5 w-5 text-legalGold" />
          AI Legal Research
        </h3>
        <button
          onClick={handleRetrieve}
          disabled={loading || !contextText}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-600 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? 'Analyzing...' : 'Find Precedents'}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {precedents.length > 0 && (
        <div className="grid gap-3">
          {precedents.map((p, idx) => (
            <div key={idx} className="rounded-lg border border-white/5 bg-navy-900/40 p-4">
              <h4 className="font-semibold text-legalGold">{p.title || p.caseName}</h4>
              <p className="mt-1 text-sm text-slate-300">{p.summary || p.description}</p>
              <div className="mt-3 text-xs font-medium text-slate-500">
                Relevance: {p.relevance || 'High'} • Court: {p.court || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && precedents.length === 0 && !error && (
        <div className="text-sm text-slate-400">
          Click the button above to discover relevant legal precedents based on the current context.
        </div>
      )}
    </div>
  );
}
