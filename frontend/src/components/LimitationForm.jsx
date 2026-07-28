import { useState } from 'react';

export default function LimitationForm({ onSubmit, loading }) {
  const [caseCategory, setCaseCategory] = useState('money_recovery');
  const [incidentDate, setIncidentDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ caseCategory, incidentDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Case Category</label>
        <select 
          value={caseCategory}
          onChange={(e) => setCaseCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        >
          <option value="money_recovery">Money Recovery</option>
          <option value="property_dispute">Property Dispute</option>
          <option value="breach_of_contract">Breach of Contract</option>
          <option value="tort_defamation">Tort/Defamation</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Date of Incident / Cause of Action</label>
        <input 
          type="date"
          value={incidentDate}
          onChange={(e) => setIncidentDate(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="premium-btn premium-btn-gold w-full flex justify-center py-3"
      >
        {loading ? 'Checking...' : 'Check Limitation Period'}
      </button>
    </form>
  );
}
