import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import IntakeStepCard from './IntakeStepCard.jsx';
import IntakeSummary from './IntakeSummary.jsx';

export default function IntakeWizard({ category, steps, onSubmit, onBack, loading }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = showSummary ? 100 : ((currentStep + 1) / (totalSteps + 1)) * 100;

  const canProceed = () => {
    if (!step.required) return true;
    const val = answers[step.id];
    return val !== undefined && val !== '' && val !== null;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      onBack();
    }
  };

  const handleEdit = (stepId) => {
    const idx = steps.findIndex((s) => s.id === stepId);
    if (idx >= 0) {
      setShowSummary(false);
      setCurrentStep(idx);
    }
  };

  const handleSubmit = () => {
    onSubmit({ category: category.id, categoryLabel: category.label, answers });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handlePrev}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentStep === 0 && !showSummary ? 'Back to Categories' : 'Previous'}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">{category.label}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-navy-900">
              {showSummary ? 'Review & Submit' : `Step ${currentStep + 1} of ${totalSteps}`}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-legalGold to-aidGreen transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="card-premium p-6 sm:p-8">
        {showSummary ? (
          <IntakeSummary
            steps={steps}
            answers={answers}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : (
          <>
            <IntakeStepCard
              key={step.id}
              step={step}
              value={answers[step.id]}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [step.id]: val }))}
            />
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="premium-btn premium-btn-secondary !py-2.5 !px-5 text-sm"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="premium-btn premium-btn-primary !py-2.5 !px-5 text-sm disabled:opacity-40"
              >
                {currentStep === totalSteps - 1 ? 'Review' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
