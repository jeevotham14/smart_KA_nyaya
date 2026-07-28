import React from 'react';

export default function EvidenceBundleExport({ onExport, isGenerating }) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-[#c49a3a] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#c49a3a]/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#092846] mb-2 flex items-center gap-2">
            <svg className="w-6 h-6 text-[#c49a3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Evidence Bundle
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl">
            Generate a court-ready indexed bundle of all uploaded evidence. The system automatically paginates, categorizes, and creates an interactive index sheet for easy navigation during hearings.
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={isGenerating}
          className="premium-btn premium-btn-gold whitespace-nowrap shadow-lg shadow-[#c49a3a]/20 shrink-0"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#051c33]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Bundle...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Generate Evidence Bundle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
