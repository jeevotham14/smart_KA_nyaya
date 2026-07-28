import React, { useEffect, useState } from 'react';
import TimelineStage from './TimelineStage';
import { legalApi } from '../services/api';
import { Loader2 } from 'lucide-react';

const STAGES = [
  {
    key: 'submitted',
    title: 'Case Filed',
    whatHappened: 'The case has been successfully filed and registered in the court system.',
    whatNext: 'The court will scrutinize the documents before issuing a notice to the respondent.',
    waitingPeriod: '3 to 7 days',
    requiredActions: null,
  },
  {
    key: 'notice',
    title: 'Notice',
    whatHappened: 'Court has reviewed the filing and sent a formal notice to the respondent.',
    whatNext: 'The respondent must acknowledge the notice and appear before the court.',
    waitingPeriod: '15 to 30 days',
    requiredActions: 'Ensure the notice has been properly served to the respondent.',
  },
  {
    key: 'written_statement',
    title: 'Written Statement',
    whatHappened: 'The respondent has submitted their written statement or reply.',
    whatNext: 'The court will frame the issues based on the petition and written statement.',
    waitingPeriod: '30 to 45 days',
    requiredActions: 'Review the respondent\'s statement with your legal counsel.',
  },
  {
    key: 'evidence',
    title: 'Evidence',
    whatHappened: 'Both parties are now required to submit their evidence and witness lists.',
    whatNext: 'Cross-examination of witnesses and examination of evidence.',
    waitingPeriod: '2 to 6 months',
    requiredActions: 'Organize and upload all supporting documents and evidence bundles.',
  },
  {
    key: 'arguments',
    title: 'Arguments',
    whatHappened: 'Evidence phase concluded. Both sides are presenting their final oral arguments.',
    whatNext: 'The judge will reserve the case for final judgment.',
    waitingPeriod: '1 to 3 months',
    requiredActions: 'Attend the court hearings regularly.',
  },
  {
    key: 'resolved',
    title: 'Judgment',
    whatHappened: 'The final judgment or decree has been passed by the court.',
    whatNext: 'The order can be executed, or either party may choose to appeal.',
    waitingPeriod: 'Immediate to 30 days for obtaining certified copy',
    requiredActions: 'Obtain the certified copy of the judgment.',
  }
];

export default function CaseTimeline({ caseId, currentStatus }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseId) {
      setLoading(true);
      legalApi.getCaseTimeline(caseId)
        .then(data => setTimelineData(data))
        .catch(err => {
          console.error('Timeline fetch error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [caseId]);

  // Try to use the backend timeline stage, otherwise fallback to mapping currentStatus, otherwise 0
  const activeKey = timelineData?.current_stage || currentStatus;
  
  // Mapping old statuses to new timeline if needed
  let mappedKey = activeKey;
  if (activeKey === 'under_review') mappedKey = 'notice';
  if (activeKey === 'routed') mappedKey = 'written_statement';

  const currentIndex = STAGES.findIndex(s => s.key === mappedKey);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="py-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Fetching timeline updates...
        </div>
      )}
      <div className="flex flex-col">
        {STAGES.map((stage, idx) => {
          const isPast = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isLast = idx === STAGES.length - 1;
          
          return (
            <TimelineStage 
              key={stage.key}
              stage={stage}
              isActive={isActive}
              isPast={isPast}
              isLast={isLast}
            />
          );
        })}
      </div>
    </div>
  );
}
