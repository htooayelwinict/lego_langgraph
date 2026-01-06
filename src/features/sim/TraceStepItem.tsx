import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import type { DetailedStepTrace } from '@/models/simulation';
import { useState } from 'react';
import { StateSnapshotViewer } from './StateSnapshotViewer';

interface TraceStepItemProps {
  step: DetailedStepTrace;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function TraceStepItem({ step, index, isActive, onClick }: TraceStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  const nodeTypeColors: Record<string, string> = {
    Start: 'bg-green-100 text-green-700',
    LLM: 'bg-purple-100 text-purple-700',
    Tool: 'bg-blue-100 text-blue-700',
    Router: 'bg-amber-100 text-amber-700',
    Reducer: 'bg-cyan-100 text-cyan-700',
    LoopGuard: 'bg-orange-100 text-orange-700',
    End: 'bg-red-100 text-red-700',
  };

  const badgeColor = nodeTypeColors[step.nodeType] || 'bg-gray-100 text-gray-700';

  return (
    <div
      className={`border-l-2 transition-all cursor-pointer ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
      }`}
    >
      {/* Step header */}
      <div
        className="px-4 py-3 flex items-start gap-3"
        onClick={() => {
          onClick();
          setIsExpanded(!isExpanded);
        }}
      >
        {/* Step number */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600">{index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>
              {step.nodeType}
            </span>
            {isActive && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 break-words">{step.explanation}</p>

          {/* Edge count info */}
          {step.firedEdgeIds.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {step.firedEdgeIds.length} edge{step.firedEdgeIds.length > 1 ? 's' : ''} fired
            </p>
          )}
          {step.blockedEdgeIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {step.blockedEdgeIds.length} blocked
            </p>
          )}
        </div>

        {/* Expand/collapse */}
        <button className="flex-shrink-0 p-1 hover:bg-gray-200 rounded">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Expanded state view */}
      {isExpanded && (
        <div className="px-4 pb-4 pl-13">
          <StateSnapshotViewer before={step.stateBefore} after={step.stateAfter} />
        </div>
      )}
    </div>
  );
}
