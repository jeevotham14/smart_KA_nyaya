import { CheckCircle2, Edit3, FileText } from 'lucide-react';

export default function IntakeSummary({ steps, answers, onEdit, onSubmit, loading }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aidGreen/10">
          <CheckCircle2 className="h-6 w-6 text-aidGreen" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-navy-900">Review Your Information</h3>
          <p className="text-sm text-slate-500">Please verify the details before generating your legal guidance.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {steps.map((step) => {
          const val = answers[step.id];
          if (!val) return null;
          const displayVal = val instanceof File ? val.name : String(val);
          return (
            <div
              key={step.id}
              className="flex items-start justify-between rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {step.question.replace(/\?$/, '')}
                </p>
                <p className="mt-1 text-sm font-medium text-navy-900 break-words">{displayVal}</p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(step.id)}
                className="ml-3 shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-legalGold"
                title="Edit this answer"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-8 w-full premium-btn premium-btn-gold text-base disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
            Analyzing Your Case...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Generate Legal Guidance
          </>
        )}
      </button>
    </div>
  );
}
