import React, { useState } from 'react';
import { Search, FileText, Book, FolderOpen, Scale } from 'lucide-react';
import { legalApi } from '../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await legalApi.globalSearch(query);
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults({ acts: [], sections: [], documents: [], cases: [] });
    } finally {
      setLoading(false);
    }
  };

  const ResultSection = ({ title, items, icon: Icon, colorClass }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Icon className={`h-6 w-6 ${colorClass}`} />
          {title}
        </h3>
        <div className="grid gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-white/10 bg-navy-800/50 p-4 transition-all hover:border-white/30">
              <h4 className="text-lg font-semibold text-slate-200">{item.title || item.name}</h4>
              <p className="text-sm text-slate-400">{item.snippet || item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Global Search</h1>
        <p className="text-lg text-slate-400">Search across Acts, Sections, Cases, and Documents</p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-6 w-6 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g. Dowry Harassment, Section 498A..."
            className="w-full rounded-full border border-white/20 bg-navy-800/80 py-4 pl-14 pr-32 text-lg text-white placeholder-slate-500 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 rounded-full bg-legalGold px-6 py-2.5 font-bold text-navy-900 transition-all hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ResultSection title="Acts" items={results.acts} icon={Book} colorClass="text-blue-400" />
          <ResultSection title="Sections" items={results.sections} icon={FileText} colorClass="text-green-400" />
          <ResultSection title="Cases" items={results.cases} icon={Scale} colorClass="text-purple-400" />
          <ResultSection title="Documents" items={results.documents} icon={FolderOpen} colorClass="text-orange-400" />
          
          {!results.acts?.length && !results.sections?.length && !results.cases?.length && !results.documents?.length && (
            <div className="text-center text-slate-400">
              No results found for "{query}". Try a different keyword.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
