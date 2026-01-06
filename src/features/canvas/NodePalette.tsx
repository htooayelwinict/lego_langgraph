import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { NodeType } from '@/models/graph';
import { useGraphStore } from '@/store/graphStore';

const nodeTypes: { type: NodeType; label: string; description: string }[] = [
  { type: 'Start', label: 'Start', description: 'Entry point' },
  { type: 'LLM', label: 'LLM', description: 'Language model' },
  { type: 'Tool', label: 'Tool', description: 'Function call' },
  { type: 'Router', label: 'Router', description: 'Conditional branch' },
  { type: 'Reducer', label: 'Reducer', description: 'Merge state' },
  { type: 'LoopGuard', label: 'Loop', description: 'Loop condition' },
  { type: 'End', label: 'End', description: 'Terminal state' },
];

export function NodePalette() {
  const { screenToFlowPosition } = useReactFlow();
  const { addNode } = useGraphStore();

  const onDragStart = useCallback((event: React.DragEvent, type: NodeType) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode, screenToFlowPosition]
  );

  const onDoubleClick = useCallback(
    (type: NodeType) => {
      const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div
      style={{
        width: 200,
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'auto',
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1e293b',
        }}
      >
        Node Palette
      </h3>

      {nodeTypes.map(({ type, label, description }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          onDoubleClick={() => onDoubleClick(type)}
          style={{
            padding: '12px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'grab',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontWeight: '500', fontSize: '13px', color: '#1e293b' }}>{label}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{description}</div>
        </div>
      ))}

      <div
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        Drag to canvas or double-click
      </div>
    </div>
  );
}
