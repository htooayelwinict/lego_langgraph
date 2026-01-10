import { ChevronDown, ChevronRight, Zap, Play, Cpu, Wrench, GitBranch, Layers, Shield, StopCircle } from 'lucide-react';
import type { DetailedStepTrace } from '@/models/simulation';
import { memo, useCallback } from 'react';
import { StateDiffPanel } from './components/StateDiffPanel';
import { useTraceUiStore, selectIsExpanded } from '@/store/traceUiStore';
import {
  TraceBody,
  TraceMetaText,
} from './components/TraceTypography';

interface TraceStepItemProps {
  step: DetailedStepTrace;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const nodeTypeColors: Record<string, string> = {
  Start: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  LLM: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
  Tool: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  Router: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  Reducer: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
  LoopGuard: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  End: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
};

const nodeTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Start: Play,
  LLM: Cpu,
  Tool: Wrench,
  Router: GitBranch,
  Reducer: Layers,
  LoopGuard: Shield,
  End: StopCircle,
};

export const TraceStepItem = memo(function TraceStepItem({
  step,
  index,
  isActive,
  onClick,
}: TraceStepItemProps) {
  const stepId = `step-${index}`;
  const isExpanded = useTraceUiStore(selectIsExpanded(stepId));
  const toggleExpanded = useTraceUiStore((state) => state.toggleExpanded);
  const setHoveredNodeId = useTraceUiStore((state) => state.setHoveredNodeId);

  const badgeColor = nodeTypeColors[step.nodeType] || 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  const NodeTypeIcon = nodeTypeIcons[step.nodeType] || Play;

  const handleClick = () => {
    onClick();
    toggleExpanded(stepId);
  };

  const handleMouseEnter = useCallback(() => {
    setHoveredNodeId(step.activeNodeId);
  }, [step.activeNodeId, setHoveredNodeId]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);

  const hasFired = step.firedEdgeIds.length > 0;
  const hasBlocked = step.blockedEdgeIds.length > 0;

  return (
    <div
      className={`border-l-2 transition-all cursor-pointer ${
        isActive
          ? 'border-indigo-400 bg-indigo-500/5'
          : 'border-transparent hover:bg-slate-800/30'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="px-4 py-3 flex items-start gap-3" onClick={handleClick}>
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
          <span className="text-xs font-medium text-slate-200">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor} flex items-center gap-1.5`}>
              <NodeTypeIcon className="w-3 h-3" />
              {step.nodeType}
            </span>
            {isActive && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          <TraceBody className="break-words text-slate-300">
            {step.explanation}
          </TraceBody>

          {hasFired && (
            <TraceMetaText className="text-emerald-400 mt-1">
              {step.firedEdgeIds.length} edge{step.firedEdgeIds.length > 1 ? 's' : ''} fired
            </TraceMetaText>
          )}
          {hasBlocked && (
            <TraceMetaText className="text-slate-500 mt-1">
              {step.blockedEdgeIds.length} blocked
            </TraceMetaText>
          )}
        </div>

        <button className="flex-shrink-0 p-1 hover:bg-slate-700/50 rounded transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pl-13 border-t border-slate-800/50">
          <StateDiffPanel before={step.stateBefore} after={step.stateAfter} />
        </div>
      )}
    </div>
  );
});
