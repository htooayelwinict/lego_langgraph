import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useSimulationStore } from '@/store/simulationStore';

// Node color schemes
const nodeColors = {
  Start: { bg: '#dbeafe', border: '#3b82f6', icon: '#1d4ed8' }, // Blue
  LLM: { bg: '#dcfce7', border: '#22c55e', icon: '#16a34a' }, // Green
  Tool: { bg: '#fef9c3', border: '#eab308', icon: '#ca8a04' }, // Yellow
  Router: { bg: '#fef3c7', border: '#f59e0b', icon: '#d97706' }, // Orange
  Reducer: { bg: '#f3e8ff', border: '#a855f7', icon: '#9333ea' }, // Purple
  LoopGuard: { bg: '#fce7f3', border: '#ec4899', icon: '#db2777' }, // Pink
  End: { bg: '#fee2e2', border: '#ef4444', icon: '#dc2626' }, // Red
};

const baseNodeStyles = `
  .custom-node {
    padding: 12px 16px;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    min-width: 120px;
    background: white;
    transition: all 0.2s ease;
  }

  .custom-node:hover {
    filter: brightness(0.95);
  }

  .custom-node.selected {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .custom-node.active {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3);
    animation: pulse-glow 1.5s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.3); }
    50% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.5); }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .node-icon {
    width: 20px;
    height: 20px;
  }
`;

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const { activeNodeIds } = useSimulationStore();
  const isActive = activeNodeIds.includes(id);
  const type = data.type as keyof typeof nodeColors;
  const colors = nodeColors[type] || nodeColors.Start;

  return (
    <div
      className={`custom-node${isActive ? ' active' : ''}${selected ? ' selected' : ''}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: isActive ? '#22c55e' : colors.border,
        boxShadow: selected ? `0 0 0 3px ${colors.border}40` : undefined,
      }}
    >
      <style>{baseNodeStyles}</style>

      {/* Source handle (top) */}
      {data.type !== 'Start' && (
        <Handle
          type="target"
          position={Position.Top}
          id="target"
          style={{ background: colors.border }}
        />
      )}

      {/* Node content */}
      <div className="node-header" style={{ color: colors.icon }}>
        <svg className="node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {getNodeIcon(data.type)}
        </svg>
        <span>{data.label}</span>
      </div>

      {/* Config summary */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
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
function getNodeIcon(type: string): string {
  switch (type) {
    case 'Start':
      return '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
    case 'LLM':
      return '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h6"/>';
    case 'Tool':
      return '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>';
    case 'Router':
      return '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>';
    case 'Reducer':
      return '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/>';
    case 'LoopGuard':
      return '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>';
    case 'End':
      return '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>';
    default:
      return '<circle cx="12" cy="12" r="10"/>';
  }
}
