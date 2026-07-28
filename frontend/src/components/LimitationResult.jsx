import { AlertCircle, CheckCircle } from 'lucide-react';

export default function LimitationResult({ result }) {
  const isExpired = result?.isExpired;
  
  return (
    <div className={`mt-8 p-6 rounded-2xl border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
      <div className="flex items-start gap-4">
        {isExpired ? (
          <AlertCircle className="h-6 w-6 text-alertRed shrink-0 mt-1" />
        ) : (
          <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
        )}
        <div>
          <h3 className={`text-lg font-bold ${isExpired ? 'text-alertRed' : 'text-green-700'}`}>
            {isExpired ? 'Limitation Period Expired' : 'Within Limitation Period'}
          </h3>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-700">
              <strong>Limitation Period:</strong> {result?.period || 'Unknown'}
            </p>
            <p className="text-sm text-slate-700">
              <strong>Deadline:</strong> {result?.deadline || 'Unknown'}
            </p>
            {result?.notes && (
              <p className="text-sm text-slate-600 italic mt-3 border-t border-slate-200 pt-3">
                <strong>Note:</strong> {result.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
