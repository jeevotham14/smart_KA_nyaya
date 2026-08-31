import { useState } from 'react';

const LIMITATION_CATEGORIES = {
  civil: {
    label: 'Civil',
    proceedings: {
      money_recovery: {
        label: 'Money Recovery',
        reliefs: {
          recovery_of_debt: { label: 'Recovery of Debt / Loan', triggerLabel: 'When was the money due?' }
        }
      }
    }
  },
  property: {
    label: 'Property',
    proceedings: {
      recovery_of_possession: {
        label: 'Recovery of Possession',
        reliefs: {
          based_on_title: { label: 'Based on Title', triggerLabel: 'When did possession become adverse to the plaintiff?' }
        }
      },
      declaration: {
        label: 'Declaration',
        reliefs: {
          title: { label: 'Declaration of Title', triggerLabel: 'When did the right to sue first accrue?' }
        }
      },
      specific_performance: {
        label: 'Specific Performance',
        reliefs: {
          contract: { label: 'Enforce Contract / Agreement', triggerLabel: 'When was performance refused by the defendant?' }
        }
      },
      cancellation_of_instrument: {
        label: 'Cancellation of Instrument',
        reliefs: {
          document: { label: 'Cancel Document / Deed', triggerLabel: 'When did the facts entitling cancellation become known?' }
        }
      }
    }
  },
  family: {
    label: 'Family',
    proceedings: {
      restitution_of_conjugal_rights: {
        label: 'Restitution of Conjugal Rights',
        reliefs: {
          conjugal_rights: { label: 'Restitution', triggerLabel: 'When was restitution demanded and refused?' }
        }
      }
    }
  }
};

export default function LimitationForm({ onSubmit, loading }) {
  const [category, setCategory] = useState('civil');
  const [proceeding, setProceeding] = useState('money_recovery');
  const [relief, setRelief] = useState('recovery_of_debt');
  const [triggerDate, setTriggerDate] = useState('');
  const [hasExceptions, setHasExceptions] = useState(false);

  const currentCategoryObj = LIMITATION_CATEGORIES[category];
  const currentProceedingObj = currentCategoryObj?.proceedings[proceeding];
  const currentReliefObj = currentProceedingObj?.reliefs[relief];

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const firstProc = Object.keys(LIMITATION_CATEGORIES[newCat].proceedings)[0];
    setProceeding(firstProc);
    setRelief(Object.keys(LIMITATION_CATEGORIES[newCat].proceedings[firstProc].reliefs)[0]);
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
      trigger_date: triggerDate,
      has_exceptions: hasExceptions
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
          {Object.entries(LIMITATION_CATEGORIES).map(([key, val]) => (
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

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1">
          {currentReliefObj?.triggerLabel || "Date of Incident"}
        </label>
        <input 
          type="date"
          value={triggerDate}
          onChange={(e) => setTriggerDate(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-legalGold focus:outline-none focus:ring-1 focus:ring-legalGold"
        />
      </div>

      <div className="flex items-start gap-2 mt-2">
        <input 
          type="checkbox" 
          id="exceptions"
          checked={hasExceptions}
          onChange={(e) => setHasExceptions(e.target.checked)}
          className="mt-1 rounded border-slate-300 text-legalGold focus:ring-legalGold"
        />
        <label htmlFor="exceptions" className="text-xs text-slate-600">
          Are there special facts? (e.g. acknowledgment of liability, continuing wrong, fraud, or minority). Selecting this will mark the result as uncertain.
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="premium-btn premium-btn-gold w-full flex justify-center py-3"
      >
        {loading ? 'Checking...' : 'Check Estimated Limitation'}
      </button>
    </form>
  );
}
