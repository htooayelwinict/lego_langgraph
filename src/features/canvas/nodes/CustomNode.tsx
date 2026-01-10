import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useSimulationStore, findStepByNodeId } from '@/store/simulationStore';
import { useTraceUiStore } from '@/store/traceUiStore';

// Vibrant node color schemes for dark theme
const nodeColors = {
  Start: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: '#3b82f6',
    icon: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.4)'
  },
  LLM: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: '#10b981',
    icon: '#34d399',
    glow: 'rgba(16, 185, 129, 0.4)'
  },
  Tool: {
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#f59e0b',
    icon: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.4)'
  },
  Router: {
    bg: 'rgba(139, 92, 246, 0.15)',
    border: '#8b5cf6',
    icon: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.4)'
  },
  Reducer: {
    bg: 'rgba(236, 72, 153, 0.15)',
    border: '#ec4899',
    icon: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.4)'
  },
  LoopGuard: {
    bg: 'rgba(6, 182, 212, 0.15)',
    border: '#06b6d4',
    icon: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.4)'
  },
  End: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#ef4444',
    icon: '#f87171',
    glow: 'rgba(239, 68, 68, 0.4)'
  },
};

const baseNodeStyles = `
  .custom-node {
    padding: 14px 18px;
    border-radius: 12px;
    border-width: 2px;
    border-style: solid;
    min-width: 140px;
    background: var(--node-bg);
    border-color: var(--node-border);
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .custom-node:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }

  .custom-node.selected {
    box-shadow: 0 0 0 3px var(--node-glow), 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .custom-node.active {
    box-shadow: 0 0 0 4px var(--node-glow), 0 0 30px var(--node-glow);
    animation: pulse-active 2s ease-in-out infinite;
  }

  @keyframes pulse-active {
    0%, 100% { 
      box-shadow: 0 0 0 4px var(--node-glow), 0 0 30px var(--node-glow); 
    }
    50% { 
      box-shadow: 0 0 0 6px var(--node-glow), 0 0 40px var(--node-glow); 
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 14px;
    color: var(--node-icon);
  }

  .node-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .node-label {
    color: #f1f5f9;
  }

  .node-config-badge {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    display: inline-block;
  }

  .react-flow__handle {
    width: 10px;
    height: 10px;
    border: 2px solid var(--bg-primary);
    transition: all 0.15s ease;
  }

  .react-flow__handle:hover {
    transform: scale(1.3);
  }
`;

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const activeNodeIds = useSimulationStore((state) => state.activeNodeIds);
  const hoveredNodeId = useTraceUiStore((state) => state.hoveredNodeId);
  const jumpToStep = useSimulationStore((state) => state.jumpToStep);
  const setHoveredNodeId = useTraceUiStore((state) => state.setHoveredNodeId);

  const isHighlighted = activeNodeIds.includes(id) || hoveredNodeId === id;
  const type = data.type as keyof typeof nodeColors;
  const colors = nodeColors[type] || nodeColors.Start;

  const handleMouseEnter = useCallback(() => {
    setHoveredNodeId(id);
  }, [id, setHoveredNodeId]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);

  const handleClick = useCallback(() => {
    const stepIndex = findStepByNodeId(id);
    if (stepIndex !== null) {
      jumpToStep(stepIndex);
    }
  }, [id, jumpToStep]);

  return (
    <div
      className={`custom-node${isHighlighted ? ' active' : ''}${selected ? ' selected' : ''}`}
      style={{
        '--node-bg': colors.bg,
        '--node-border': colors.border,
        '--node-icon': colors.icon,
        '--node-glow': colors.glow,
      } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <style>{baseNodeStyles}</style>

      {/* Target handle (top) */}
      {data.type !== 'Start' && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          style={{ background: colors.border }}
        />
      )}

      {/* Node content */}
      <div className="node-header">
        <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {getNodeIcon(data.type)}
        </svg>
        <span className="node-label">{data.label}</span>
      </div>

      {/* Config summary */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="node-config-badge">
          {Object.keys(data.config).length} config items
        </div>
      )}

      {/* Source handle (bottom) */}
      {data.type !== 'End' && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="source"
          style={{ background: colors.border }}
        />
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// Node icons
function getNodeIcon(type: string): React.ReactNode {
  switch (type) {
    case 'Start':
      return <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>;
    case 'LLM':
      return <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h6" /></>;
    case 'Tool':
      return <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;
    case 'Router':
      return <><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></>;
    case 'Reducer':
      return <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-10" /></>;
    case 'LoopGuard':
      return <><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></>;
    case 'End':
      return <><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></>;
    default:
      return <circle cx="12" cy="12" r="10" />;
  }
}
