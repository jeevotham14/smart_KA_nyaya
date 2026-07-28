import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TimelineStage({ stage, isActive, isPast, isLast }) {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div className="relative flex gap-4 w-full">
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-[15px] top-8 bottom-[-16px] w-[2px] ${isPast ? 'bg-aidGreen' : 'bg-slate-200'}`} />
      )}
      
      {/* Icon */}
      <div className="shrink-0 mt-1 relative z-10">
        {isPast ? (
          <CheckCircle2 className="w-8 h-8 text-aidGreen bg-white rounded-full" />
        ) : isActive ? (
          <div className="relative">
            <div className="absolute inset-0 bg-legalGold rounded-full animate-ping opacity-25"></div>
            <Circle className="w-8 h-8 text-legalGold bg-white rounded-full fill-legalGold/10" />
          </div>
        ) : (
          <Circle className="w-8 h-8 text-slate-300 bg-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
        <div 
          className={`rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            isActive 
              ? 'bg-white/80 border-legalGold shadow-[0_4px_20px_-4px_rgba(200,160,80,0.3)]' 
              : isPast 
                ? 'bg-white/60 border-slate-200 shadow-sm' 
                : 'bg-white/40 border-slate-100 opacity-70'
          }`}
        >
          <div 
            className="p-4 cursor-pointer flex justify-between items-center"
            onClick={() => setExpanded(!expanded)}
          >
            <div>
              <h3 className={`font-bold text-lg ${isActive ? 'text-navy-900' : 'text-slate-700'}`}>
                {stage.title}
              </h3>
              {isActive && <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-legalGold/20 text-yellow-800">Current Stage</span>}
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>

          {expanded && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100/50">
              <div className="grid gap-4 mt-2">
                {/* What happened */}
                <div className="flex gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-navy-800">What happened: </span>
                    {stage.whatHappened}
                  </div>
                </div>

                {/* What happens next */}
                <div className="flex gap-2 text-sm text-slate-600">
                  <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-navy-800">What happens next: </span>
                    {stage.whatNext}
                  </div>
                </div>

                {/* Waiting period */}
                <div className="flex gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-navy-800">Typical waiting period: </span>
                    {stage.waitingPeriod}
                  </div>
                </div>

                {/* Required Actions */}
                {stage.requiredActions && (
                  <div className="flex gap-2 text-sm text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-amber-800">Required Action: </span>
                      <span className="text-amber-700">{stage.requiredActions}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
