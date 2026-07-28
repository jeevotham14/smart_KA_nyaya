import React from 'react';

export default function EvidenceFolder({ title, files }) {
  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Subtle background decoration */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-[#092846]/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-[#092846] flex items-center justify-center text-white shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#092846]">{title}</h3>
        <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
          {files.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 relative z-10 pr-1 custom-scrollbar">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-slate-500 text-center">Empty Folder</p>
          </div>
        ) : (
          files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-white/40 hover:bg-white/80 hover:border-slate-300 transition-all shadow-sm group/file cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#092846] shrink-0 shadow-sm group-hover/file:bg-[#092846] group-hover/file:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(9, 40, 70, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(9, 40, 70, 0.2);
        }
      `}} />
    </div>
  );
}
