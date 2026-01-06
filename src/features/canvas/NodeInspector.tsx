import { useGraphStore } from '@/store/graphStore';
import { useUiStore } from '@/store/uiStore';
import { Settings, Trash2, ChevronRight } from 'lucide-react';
import { NodeConfigForm } from './node-configs/NodeConfigForm';
import { NodeType } from '@/models/graph';

const NODE_TYPE_LABELS: Record<NodeType, { label: string; color: string }> = {
  Start: { label: 'Start Node', color: '#3b82f6' },
  LLM: { label: 'LLM Node', color: '#10b981' },
  Tool: { label: 'Tool Node', color: '#f59e0b' },
  Router: { label: 'Router Node', color: '#8b5cf6' },
  Reducer: { label: 'Reducer Node', color: '#ec4899' },
  LoopGuard: { label: 'Loop Guard', color: '#06b6d4' },
  End: { label: 'End Node', color: '#ef4444' },
};

export function NodeInspector() {
  const { nodes, selectedNodeId, updateNode, deleteNode } = useGraphStore();
  const { showInspector, toggleInspector } = useUiStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Don't show if no node selected or panel is hidden
  if (!selectedNode || !showInspector) {
    return null;
  }

  const nodeType = selectedNode.data.type as NodeType;
  const nodeInfo = NODE_TYPE_LABELS[nodeType];

  const handleLabelChange = (label: string) => {
    updateNode(selectedNodeId!, { label });
  };

  const handleConfigChange = (config: Record<string, unknown>) => {
    updateNode(selectedNodeId!, { config });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedNode.data.label}" node?`)) {
      deleteNode(selectedNodeId!);
    }
  };

  return (
    <div className="node-inspector">
      <style>{`
        .node-inspector {
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .inspector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .inspector-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .inspector-title svg {
          color: var(--accent-cyan);
        }

        .inspector-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .inspector-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .inspector-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .inspector-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: var(--accent-red-light);
        }

        .node-type-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          margin: var(--space-4);
          padding: var(--space-2) var(--space-3);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          color: var(--badge-color);
          flex-shrink: 0;
        }

        .node-type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--badge-color);
        }

        .label-section {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .label-field {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: var(--space-2);
        }

        .label-input {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .label-input:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .label-input::placeholder {
          color: var(--text-muted);
        }

        .config-section {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-4);
          min-height: 0;
        }
      `}</style>

      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <Settings size={18} />
          <span>Node Inspector</span>
        </div>
        <div className="inspector-actions">
          <button
            onClick={handleDelete}
            className="inspector-btn delete"
            title="Delete node"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={toggleInspector}
            className="inspector-btn"
            title="Hide panel"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Node Type Badge */}
      <div
        className="node-type-badge"
        style={{ '--badge-color': nodeInfo.color } as React.CSSProperties}
      >
        <span className="node-type-dot" />
        {nodeInfo.label}
      </div>

      {/* Label Editor */}
      <div className="label-section">
        <label className="label-field">
          Label
        </label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="label-input"
          placeholder="Node label"
        />
      </div>

      {/* Node-specific Config */}
      <div className="config-section">
        <NodeConfigForm
          nodeType={nodeType}
          config={selectedNode.data.config || {}}
          onChange={handleConfigChange}
        />
      </div>
    </div>
  );
}
