import { AlertTriangle, CheckCircle2, Clock, FileWarning, Scale, TrendingUp } from 'lucide-react';

function ScoreBar({ label, value, icon: Icon, color }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </span>
        <span className="text-xs font-bold text-navy-900">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            value >= 70 ? 'bg-aidGreen' : value >= 40 ? 'bg-legalGold' : 'bg-alertRed'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function LegalHealthScore({ score }) {
  if (!score) return null;

  const urgencyColors = {
    low: 'bg-aidGreen/10 text-aidGreen',
    medium: 'bg-legalGold/10 text-legalGold',
    high: 'bg-alertRed/10 text-alertRed',
    critical: 'bg-alertRed text-white',
  };

  return (
    <div className="card-premium p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-50">
          <TrendingUp className="h-5 w-5 text-legalGold" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-navy-900">Legal Health Score</h3>
          <p className="text-xs text-slate-400">AI-assisted assessment — not a legal opinion</p>
        </div>
      </div>

      <div className="grid gap-4">
        <ScoreBar label="Case Strength" value={score.case_strength} icon={Scale} color="text-navy-700" />
        <ScoreBar label="Evidence Score" value={score.evidence_score} icon={CheckCircle2} color="text-aidGreen" />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-400">Urgency</p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${urgencyColors[score.urgency] || urgencyColors.medium}`}>
            {score.urgency}
          </span>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-400">Settlement Possibility</p>
          <span className="mt-1 inline-block text-sm font-bold text-navy-900 capitalize">
            {score.settlement_possibility}
          </span>
        </div>
      </div>

      {score.limitation_risk && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-alertRed/20 bg-alertRed/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-alertRed" />
          <div>
            <p className="text-xs font-bold text-alertRed">Limitation Period Warning</p>
            <p className="text-xs text-slate-600">
              {score.limitation_days_remaining != null
                ? `${score.limitation_days_remaining} days remaining to file`
                : 'Time-sensitive — act promptly'}
            </p>
          </div>
        </div>
      )}

      {score.missing_documents?.length > 0 && (
        <div className="mt-4 rounded-xl bg-legalGold/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-legalGold">
            <FileWarning className="h-3.5 w-3.5" /> Missing Documents
          </p>
          <ul className="grid gap-1 text-xs text-slate-600">
            {score.missing_documents.map((doc) => (
              <li key={doc} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-slate-400" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 rounded-xl bg-slate-50 p-2.5 text-center text-[10px] text-slate-400">
        ️ This is an AI-assisted assessment and does NOT constitute legal advice. Consult a qualified advocate for official guidance.
      </p>
    </div>
  );
}
