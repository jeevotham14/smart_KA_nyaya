export default function DocumentPreview({ content, isHtml = false }) {
  return (
    <div className="print-ready">
      <div className="mt-5 min-h-[520px] whitespace-pre-wrap rounded-sm border border-slate-200 bg-slate-50 p-6 sm:p-8 text-sm leading-6 text-slate-800 shadow-inner font-serif">
        {isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          content
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-ready, .print-ready * {
            visibility: visible;
          }
          .print-ready {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            border: none;
            padding: 0;
            margin: 0;
            box-shadow: none;
          }
        }
      `}} />
    </div>
  );
}
