import { Download, Printer, Save, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DownloadButtons({ onPrint, onDownloadPdf, onDownloadDocx, onSave, saved }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      {onSave && (
        <button
          className="inline-flex h-10 px-3 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors"
          onClick={onSave}
          title={t('docGen.saveDraft') || "Save Draft"}
          type="button"
        >
          <Save className="h-4 w-4 mr-2" aria-hidden="true" />
          <span className="text-sm font-semibold">{saved ? 'Saved' : 'Save'}</span>
        </button>
      )}
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors"
        onClick={onPrint}
        title={t('docGen.printPlaceholder') || "Print"}
        type="button"
      >
        <Printer className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-legalGold text-navy-900 hover:bg-legalGold/90 transition-colors"
        onClick={onDownloadPdf}
        title="Download PDF"
        type="button"
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-navy-800 text-white hover:bg-navy-700 transition-colors"
        onClick={onDownloadDocx}
        title="Download DOCX"
        type="button"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
