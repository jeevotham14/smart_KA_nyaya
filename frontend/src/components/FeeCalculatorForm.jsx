import { useState } from 'react';

const COURT_FEE_CATEGORIES = {
  civil: {
    label: 'Civil',
    proceedings: {
      money_recovery: {
        label: 'Money Recovery',
        reliefs: {
          any: { label: 'Any', requiresValuation: true, valuationLabel: 'Claim / Suit Value (₹)' }
        }
      }
    }
  },
  family: {
    label: 'Family',
    proceedings: {
      divorce_maintenance: {
        label: 'Divorce / Custody / Maintenance',
        reliefs: {
          any: { label: 'Any', requiresValuation: false }
        }
      }
    }
  },
  property: {
    label: 'Property',
    proceedings: {
      possession: {
        label: 'Recovery of Possession',
        reliefs: {
          title_based: { label: 'Based on Title', requiresValuation: true, valuationLabel: 'Property Market Value (₹)' }
        }
      },
      declaration: {
        label: 'Declaration of Title',
        reliefs: {
          without_possession: { label: 'Without consequential relief', requiresValuation: false }
        }
      }
    }
  },
  criminal: {
    label: 'Criminal',
    proceedings: {
      complaint: {
        label: 'Criminal Complaint',
        reliefs: {
          any: { label: 'Any', requiresValuation: false }
        }
      }
    }
  },
  consumer: {
    label: 'Consumer',
    proceedings: {
      complaint: {
        label: 'Consumer Complaint',
        reliefs: {
          under_5_lakhs: { label: 'Claim under ₹5 Lakhs', requiresValuation: true, valuationLabel: 'Claim Value (₹)' }
        }
      }
    }
  }
};

export default function FeeCalculatorForm({ onSubmit, loading }) {
  const [category, setCategory] = useState('civil');
  const [proceeding, setProceeding] = useState('money_recovery');
  const [relief, setRelief] = useState('any');
  const [valuation, setValuation] = useState('');

  const currentCategoryObj = COURT_FEE_CATEGORIES[category];
  const currentProceedingObj = currentCategoryObj?.proceedings[proceeding];
  const currentReliefObj = currentProceedingObj?.reliefs[relief];

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const firstProc = Object.keys(COURT_FEE_CATEGORIES[newCat].proceedings)[0];
    setProceeding(firstProc);
    setRelief(Object.keys(COURT_FEE_CATEGORIES[newCat].proceedings[firstProc].reliefs)[0]);
  };

  const handleProceedingChange = (e) => {
    const newProc = e.target.value;
    setProceeding(newProc);
    setRelief(Object.keys(currentCategoryObj.proceedings[newProc].reliefs)[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      category, 
      proceeding, 
      relief, 
      valuation: currentReliefObj?.requiresValuation ? Number(valuation) : null 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Case Category</label>
        <select 
          value={category}
          onChange={handleCategoryChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        >
          {Object.entries(COURT_FEE_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Nature of Proceeding</label>
        <select 
          value={proceeding}
          onChange={handleProceedingChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        >
          {currentCategoryObj && Object.entries(currentCategoryObj.proceedings).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">Relief Sought</label>
        <select 
          value={relief}
          onChange={(e) => setRelief(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        >
          {currentProceedingObj && Object.entries(currentProceedingObj.reliefs).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {currentReliefObj?.requiresValuation && (
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1">
            {currentReliefObj.valuationLabel}
          </label>
          <input 
            type="number"
            value={valuation}
            onChange={(e) => setValuation(e.target.value)}
            required
            min="0"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
            placeholder="e.g. 100000"
          />
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="premium-btn premium-btn-gold w-full flex justify-center py-3"
      >
        {loading ? 'Calculating...' : 'Calculate Estimated Fee'}
      </button>
    </form>
  );
}
