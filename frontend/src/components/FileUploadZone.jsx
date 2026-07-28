import React, { useState, useRef } from 'react';

export default function FileUploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`relative p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
        isDragging ? 'border-[#c49a3a] bg-[#c49a3a]/10' : 'border-slate-300 bg-white/50 hover:border-slate-400'
      } glass-card`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center text-center cursor-pointer">
        <div className="w-16 h-16 mb-4 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Drag & Drop files here</h3>
        <p className="text-sm text-slate-500">or click to browse from your device</p>
      </div>
    </div>
  );
}
