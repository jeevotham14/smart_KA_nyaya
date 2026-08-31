import { AlertCircle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LimitationResult({ result }) {
  if (!result) return null;

  const { status, period, start_date, estimated_deadline, legal_basis, notes, disclaimer } = result;

  const getStatusConfig = (status) => {
    switch(status) {
      case 'WITHIN_LIMITATION':
        return { icon: CheckCircle, colorClass: 'text-green-700', bgClass: 'bg-green-50 border-green-200', title: 'Within Estimated Limitation Period' };
      case 'POSSIBLY_EXPIRED':
        return { icon: AlertCircle, colorClass: 'text-alertRed', bgClass: 'bg-red-50 border-red-200', title: 'Possibly Expired' };
      case 'UNCERTAIN':
        return { icon: HelpCircle, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 border-amber-200', title: 'Limitation Uncertain' };
      default:
        return { icon: HelpCircle, colorClass: 'text-slate-700', bgClass: 'bg-slate-50 border-slate-200', title: 'More Information Required' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const showCalculations = status === 'WITHIN_LIMITATION' || status === 'POSSIBLY_EXPIRED' || status === 'UNCERTAIN';

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${config.bgClass}`}>
      <div className="flex items-start gap-4 mb-4">
        <Icon className={`h-6 w-6 shrink-0 mt-1 ${config.colorClass}`} />
        <div>
          <h3 className={`text-lg font-bold ${config.colorClass}`}>
            {config.title}
          </h3>
          
          {showCalculations && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</span>
                <span className="text-sm font-medium text-navy-900">{start_date}</span>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimated Deadline</span>
                <span className="text-sm font-medium text-navy-900">{estimated_deadline}</span>
              </div>
              <div className="bg-white/60 p-3 rounded-lg sm:col-span-2">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Period Length</span>
                <span className="text-sm font-medium text-navy-900">{period}</span>
              </div>
            </div>
          )}

          {(!showCalculations || status === 'UNCERTAIN') && (
            <div className="mt-4 mb-2">
              <p className="text-sm text-slate-700 mb-4">
                {status === 'UNCERTAIN' 
                  ? 'Due to the presence of special facts (like acknowledgment, continuous wrong, or fraud), the exact limitation cannot be determined automatically.'
                  : notes?.[0] || 'The exact rule for this situation could not be configured or requires more details.'}
              </p>
              <Link to="/consultations" className="inline-block bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors">
                Consult an Advocate
              </Link>
            </div>
          )}

          {notes && notes.length > 0 && showCalculations && (
            <div className="mt-4 space-y-2 border-t border-black/5 pt-3">
              {notes.map((note, idx) => (
                <p key={idx} className="text-sm text-slate-700 italic flex gap-2">
                  <span className="font-bold text-slate-400">•</span> {note}
                </p>
              ))}
            </div>
          )}

          {legal_basis && (
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-4">
              <Info className="h-4 w-4" /> <strong>Legal Basis:</strong> {legal_basis}
            </p>
          )}
        </div>
      </div>

      {disclaimer && (
        <div className="mt-6 pt-4 border-t border-black/10">
          <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
            <strong>Disclaimer:</strong> {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
