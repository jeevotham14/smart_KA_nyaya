import { Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function FeeResult({ result }) {
  if (!result) return null;

  const { status, estimated_fee, calculation_summary, legal_basis, disclaimer } = result;

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${status === 'CALCULATED' ? 'bg-navy-50 border-legalGold/30' : 'bg-red-50 border-red-200'}`}>
      
      {status === 'CALCULATED' && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-navy-900">Estimated Court Fee</h3>
          </div>
          <div className="text-3xl font-extrabold text-legalGold mb-4">
            ₹{estimated_fee?.toLocaleString('en-IN') || 0}
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              <span className="font-semibold block mb-1">Calculation Notes:</span>
              {calculation_summary}
            </p>
            {legal_basis && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="h-4 w-4" /> <strong>Legal Basis:</strong> {legal_basis}
              </p>
            )}
          </div>
        </>
      )}

      {(status === 'RULE_NOT_CONFIGURED' || status === 'MORE_INFORMATION_REQUIRED' || status === 'INVALID_INPUT') && (
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-navy-900 mb-2">
            {status === 'RULE_NOT_CONFIGURED' ? 'Rule Not Configured' : 'More Information Required'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {calculation_summary || 'The court fee for this specific combination cannot be estimated confidently.'}
          </p>
          <Link to="/consultations" className="inline-block bg-legalGold text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-legalGold/90 transition-colors">
            Consult an Advocate
          </Link>
        </div>
      )}

      {disclaimer && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed italic">
            <strong>Disclaimer:</strong> {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
