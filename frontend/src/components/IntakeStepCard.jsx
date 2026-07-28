import { AlertCircle, HelpCircle, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function IntakeStepCard({ step, value, onChange }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const baseInput =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-navy-900 outline-none transition-all duration-300 focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 placeholder:text-slate-400';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <div className="animate-fade-in">
      <label className="mb-3 block font-display text-lg font-bold text-navy-900">
        {step.question}
        {step.required && <span className="ml-1 text-alertRed">*</span>}
      </label>

      {step.helpText && (
        <p className="mb-3 flex items-start gap-1.5 text-xs text-slate-400">
          <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {step.helpText}
        </p>
      )}

      {step.type === 'select' && (
        <select
          className={baseInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option...</option>
          {step.options.map((opt) => (
             <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {step.type === 'text' && (
        <input
          type="text"
          className={baseInput}
          placeholder={step.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {step.type === 'number' && (
        <input
          type="number"
          className={baseInput}
          placeholder={step.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min="0"
        />
      )}

      {step.type === 'date' && (
        <input
          type="date"
          className={baseInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      )}

      {step.type === 'textarea' && (
        <textarea
          className={`${baseInput} min-h-[140px] resize-y`}
          placeholder={step.placeholder || ''}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      )}

      {step.type === 'radio' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {step.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                value === opt
                  ? 'border-legalGold bg-legalGold/5 text-navy-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${
                value === opt ? 'bg-legalGold' : 'bg-slate-300'
              }`} />
              {opt}
            </button>
          ))}
        </div>
      )}

      {step.type === 'file' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-8 text-center transition-all duration-200 hover:border-legalGold hover:bg-legalGold/5"
        >
          <Upload className="mb-2 h-6 w-6 text-slate-400" />
          {fileName ? (
            <p className="text-sm font-semibold text-navy-900">{fileName}</p>
          ) : (
            <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={handleFile}
          />
        </div>
      )}
    </div>
  );
}
