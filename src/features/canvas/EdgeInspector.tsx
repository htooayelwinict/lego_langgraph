import { useGraphStore } from '@/store/graphStore';
import { useUiStore } from '@/store/uiStore';
import { useStateStore } from '@/store/stateStore';
import { validateCondition, type ConditionValidationResult } from '@/services/conditionEvaluator';
import { Link2, Trash2, ChevronRight, HelpCircle, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

export function EdgeInspector() {
  const { nodes, edges, selectedEdgeId, updateEdge, deleteEdge } = useGraphStore();
  const { showInspector, toggleInspector } = useUiStore();
  const { schema } = useStateStore();

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // Validate condition against schema
  const conditionValidation = useMemo((): ConditionValidationResult | null => {
    const condition = selectedEdge?.data?.condition;
    if (!condition) return null;
    return validateCondition(condition, schema);
  }, [selectedEdge?.data?.condition, schema]);

  // Get source and target nodes for context
  const sourceNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.source)
    : null;
  const targetNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.target)
    : null;

  // Check if source is a Router or LoopGuard (these support edge conditions)
  const isConditionalSource =
    sourceNode?.data.type === 'Router' || sourceNode?.data.type === 'LoopGuard';

  // Don't show if no edge selected or panel is hidden
  if (!selectedEdge || !showInspector) {
    return null;
  }

  const edgeData = selectedEdge.data || {};

  const handleLabelChange = (label: string) => {
    updateEdge(selectedEdgeId!, { ...edgeData, label });
  };

  const handleConditionChange = (condition: string) => {
    updateEdge(selectedEdgeId!, { ...edgeData, condition });
  };

  const handleDelete = () => {
    if (confirm(`Delete edge from "${sourceNode?.data.label}" to "${targetNode?.data.label}"?`)) {
      deleteEdge(selectedEdgeId!);
    }
  };

  return (
    <div className="edge-inspector">
      <style>{`
        .edge-inspector {
          width: 100%;
          max-height: 50%;
          flex-shrink: 0;
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
          color: var(--accent-amber);
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

        .connection-info {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-primary);
        }

        .connection-flow {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 13px;
        }

        .connection-node {
          font-weight: 500;
          color: var(--text-primary);
        }

        .connection-arrow {
          color: var(--text-muted);
        }

        .conditional-hint {
          margin-top: var(--space-2);
          font-size: 11px;
          color: var(--accent-blue);
          padding: var(--space-2);
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-sm);
        }

        .input-section {
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
        }

        .input-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: var(--space-2);
        }

        .input-field {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .input-field:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .input-field::placeholder {
          color: var(--text-muted);
        }

        .input-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: var(--space-1);
        }

        .textarea-field {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 13px;
          font-family: var(--font-mono);
          resize: vertical;
          transition: all var(--transition-fast);
        }

        .textarea-field:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .syntax-help {
          margin-top: var(--space-3);
        }

        .syntax-help summary {
          font-size: 11px;
          color: var(--accent-blue);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .syntax-help summary:hover {
          color: var(--accent-blue-light);
        }

        .syntax-content {
          margin-top: var(--space-2);
          padding: var(--space-3);
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-md);
          font-size: 11px;
          color: var(--accent-blue-light);
        }

        .syntax-content code {
          background: var(--bg-elevated);
          padding: 1px 4px;
          border-radius: 3px;
          font-family: var(--font-mono);
        }

        .syntax-content ul {
          margin: var(--space-2) 0 0 var(--space-4);
          list-style: disc;
        }

        .info-section {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
        }

        .info-box {
          padding: var(--space-4);
          background: var(--bg-primary);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--text-secondary);
        }

        .info-box-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .info-box-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: var(--space-2);
        }

        .validation-warnings {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .validation-warning,
        .validation-error {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          font-size: 11px;
        }

        .validation-warning {
          background: rgba(251, 191, 36, 0.1);
          color: var(--accent-amber);
        }

        .validation-error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red-light);
        }
      `}</style>

      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <Link2 size={18} />
          <span>Edge Inspector</span>
        </div>
        <div className="inspector-actions">
          <button
            onClick={handleDelete}
            className="inspector-btn delete"
            title="Delete edge"
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

      {/* Connection Info */}
      <div className="connection-info">
        <div className="connection-flow">
          <span className="connection-node">{sourceNode?.data.label}</span>
          <span className="connection-arrow">→</span>
          <span className="connection-node">{targetNode?.data.label}</span>
        </div>
        {isConditionalSource && (
          <div className="conditional-hint">
            Conditional edge: source node type supports conditions
          </div>
        )}
      </div>

      {/* Label */}
      <div className="input-section">
        <label className="input-label">Label</label>
        <input
          type="text"
          value={edgeData.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="input-field"
          placeholder="Edge label (optional)"
        />
        <p className="input-hint">Displayed on the edge in the canvas</p>
      </div>

      {/* Condition (only for Router/LoopGuard sources) */}
      {isConditionalSource && (
        <div className="input-section">
          <label className="input-label">Condition</label>
          <textarea
            value={(edgeData.condition as string) || ''}
            onChange={(e) => handleConditionChange(e.target.value)}
            className="textarea-field"
            placeholder={sourceNode?.data.type === 'Router' ? 'state.status === "success"' : 'state.iterations < 10'}
            rows={4}
          />
          <p className="input-hint">
            {sourceNode?.data.type === 'Router'
              ? 'Condition to determine if this path is taken.'
              : 'Loop continuation condition. True = continue, False = exit.'}
          </p>

          {/* Condition Syntax Help */}
          <details className="syntax-help">
            <summary>
              <HelpCircle size={12} />
              Condition syntax help
            </summary>
            <div className="syntax-content">
              <p><strong>State access:</strong> <code>state.field_name</code></p>
              <p><strong>Comparisons:</strong> <code>===</code>, <code>!==</code>, <code>&gt;</code>, <code>&lt;</code></p>
              <p><strong>Logic:</strong> <code>&&</code> (and), <code>||</code> (or), <code>!</code> (not)</p>
              <ul>
                <li><code>state.count &gt; 5</code></li>
                <li><code>state.status === "success"</code></li>
              </ul>
            </div>
          </details>

          {/* Schema Validation Warnings */}
          {conditionValidation && (conditionValidation.warnings.length > 0 || conditionValidation.errors.length > 0) && (
            <div className="validation-warnings" style={{ marginTop: 'var(--space-3)' }}>
              {conditionValidation.warnings.map((warning, idx) => (
                <div key={`warn-${idx}`} className="validation-warning">
                  <AlertTriangle size={12} style={{ color: 'var(--accent-amber)' }} />
                  <span>{warning}</span>
                </div>
              ))}
              {conditionValidation.errors.map((error, idx) => (
                <div key={`err-${idx}`} className="validation-error">
                  <AlertTriangle size={12} style={{ color: 'var(--accent-red-light)' }} />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="info-section">
        <div className="info-box">
          <p className="info-box-title">About Edge Conditions</p>
          <p>
            {isConditionalSource
              ? `This edge originates from a ${sourceNode?.data.type} node, which supports conditional routing.`
              : `This edge connects directly. ${sourceNode?.data.type} nodes don't support conditional routing.`}
          </p>
          {!isConditionalSource && (
            <p className="info-box-hint">
              Add a Router or Loop Guard node to enable conditional routing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
