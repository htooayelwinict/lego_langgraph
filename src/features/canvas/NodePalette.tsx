import { useCallback } from 'react';
import { NodeType } from '@/models/graph';
import { useGraphStore } from '@/store/graphStore';
import {
  Circle,
  MessageSquare,
  Wrench,
  GitBranch,
  Layers,
  RefreshCw,
  Square
} from 'lucide-react';

const nodeTypes: { type: NodeType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { type: 'Start', label: 'Start', description: 'Entry point', icon: <Circle size={16} />, color: 'var(--accent-blue)' },
  { type: 'LLM', label: 'LLM', description: 'Language model', icon: <MessageSquare size={16} />, color: 'var(--accent-emerald)' },
  { type: 'Tool', label: 'Tool', description: 'Function call', icon: <Wrench size={16} />, color: 'var(--accent-amber)' },
  { type: 'Router', label: 'Router', description: 'Conditional branch', icon: <GitBranch size={16} />, color: 'var(--accent-purple)' },
  { type: 'Reducer', label: 'Reducer', description: 'Merge state', icon: <Layers size={16} />, color: 'var(--accent-pink)' },
  { type: 'LoopGuard', label: 'Loop', description: 'Loop condition', icon: <RefreshCw size={16} />, color: 'var(--accent-cyan)' },
  { type: 'End', label: 'End', description: 'Terminal state', icon: <Square size={16} />, color: 'var(--accent-red)' },
];

export function NodePalette() {
  const { addNode } = useGraphStore();

  const onDragStart = useCallback((event: React.DragEvent, type: NodeType) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDoubleClick = useCallback(
    (type: NodeType) => {
      const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="node-palette">
      <style>{`
        .node-palette {
          width: 200px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          overflow-y: auto;
        }

        .palette-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--border-subtle);
        }

        .palette-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .palette-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: grab;
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .palette-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--item-color);
          opacity: 0.6;
          transition: all var(--transition-normal);
        }

        .palette-item:hover {
          border-color: var(--item-color);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .palette-item:hover::before {
          opacity: 1;
          width: 4px;
        }

        .palette-item:active {
          cursor: grabbing;
          transform: translateX(4px) scale(0.98);
        }

        .palette-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: var(--item-color);
          flex-shrink: 0;
        }

        .palette-info {
          flex: 1;
          min-width: 0;
        }

        .palette-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .palette-desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .palette-hint {
          margin-top: var(--space-3);
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
        }

        .palette-hint kbd {
          margin: 0 2px;
        }
      `}</style>

      <div className="palette-header">
        <span className="palette-title">Node Palette</span>
      </div>

      {nodeTypes.map(({ type, label, description, icon, color }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          onDoubleClick={() => onDoubleClick(type)}
          className="palette-item"
          style={{ '--item-color': color } as React.CSSProperties}
        >
          <div className="palette-icon">
            {icon}
          </div>
          <div className="palette-info">
            <div className="palette-label">{label}</div>
            <div className="palette-desc">{description}</div>
          </div>
        </div>
      ))}

      <div className="palette-hint">
        Drag to canvas or <kbd>dbl-click</kbd>
      </div>
    </div>
  );
}
