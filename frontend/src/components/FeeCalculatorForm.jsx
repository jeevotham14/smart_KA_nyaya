import { useState } from 'react';

export default function FeeCalculatorForm({ onSubmit, loading }) {
  const [caseType, setCaseType] = useState('civil');
  const [claimAmount, setClaimAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ caseType, claimAmount: Number(claimAmount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Case Type</label>
        <select 
          value={caseType}
          onChange={(e) => setCaseType(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        >
          <option value="civil">Civil Suit</option>
          <option value="family">Family Court</option>
          <option value="appeal">Appeal</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Claim Amount (₹)</label>
        <input 
          type="number"
          value={claimAmount}
          onChange={(e) => setClaimAmount(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
          placeholder="e.g. 100000"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="premium-btn premium-btn-gold w-full flex justify-center py-3"
      >
        {loading ? 'Calculating...' : 'Calculate Fee'}
      </button>
    </form>
  );
}
