import React from 'react';
import { UserPlus, Download, FileText, CheckCircle } from 'lucide-react';

export default function LawyerReferral({ caseSummary, complexityScore }) {
  const isHighComplexity = complexityScore && complexityScore >= 7;

  const handleExportSummary = () => {
    const text = `CASE SUMMARY for Lawyer Consultation\n\n${caseSummary || 'No summary available.'}\n\nComplexity Score: ${complexityScore || 'N/A'}/10`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lawyer_consultation_summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isHighComplexity) return null;

  return (
    <div className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="rounded-full bg-orange-500/20 p-3">
          <UserPlus className="h-6 w-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Lawyer Consultation Recommended</h3>
          <p className="mt-1 text-sm text-orange-200">
            Based on the details provided, this case has a high complexity level. We strongly recommend consulting with a legal professional.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-navy-900/50 p-4">
          <h4 className="mb-2 font-semibold text-slate-200">Preparation Checklist</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Gather all relevant documents</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Prepare a timeline of events</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Export the summary for your lawyer</li>
          </ul>
        </div>
        <div className="flex flex-col items-start justify-center gap-3">
          <button
            onClick={handleExportSummary}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-legalGold px-4 py-3 font-semibold text-navy-900 transition-all hover:bg-yellow-500"
          >
            <Download className="h-5 w-5" />
            Export Summary for Lawyer
          </button>
          <a
            href="/directory"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-navy-800 px-4 py-3 font-semibold text-white transition-all hover:bg-navy-700"
          >
            <FileText className="h-5 w-5" />
            Find a Lawyer
          </a>
        </div>
      </div>
    </div>
  );
}
