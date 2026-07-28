import React from 'react';
import { Scale } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-navy-900 transition-colors duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-legalGold/30">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-legalGold border-r-transparent border-b-transparent border-l-transparent"></div>
          <Scale className="h-6 w-6 text-legalGold animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-widest text-navy-600 dark:text-navy-200 animate-pulse">LOADING...</p>
      </div>
    </div>
  );
}
