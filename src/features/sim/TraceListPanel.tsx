import { useSimulationStore } from '@/store/simulationStore';
import { useUiStore } from '@/store/uiStore';
import { TraceStepItem } from './TraceStepItem';
import { List, ChevronRight } from 'lucide-react';

export function TraceListPanel() {
  const { trace, executionTrace, jumpToStep } = useSimulationStore();
  const { showTraceList, toggleTraceList } = useUiStore();

  // Don't show if panel is hidden
  if (!showTraceList) {
    return null;
  }

  if (!executionTrace || executionTrace.steps.length === 0) {
    return (
      <div className="trace-list-panel">
        <style>{`
          .trace-list-panel {
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
            color: var(--accent-emerald);
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

          .empty-state {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            padding: var(--space-4);
            color: var(--text-muted);
            text-align: center;
          }

          .empty-state svg {
            opacity: 0.5;
          }

          .empty-state-title {
            font-size: 14px;
            font-weight: 500;
          }

          .empty-state-hint {
            font-size: 12px;
          }

          .trace-list {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            min-height: 0;
          }

          .status-footer {
            padding: var(--space-4);
            border-top: 1px solid var(--border-subtle);
            flex-shrink: 0;
            font-size: 13px;
            font-weight: 500;
          }

          .status-footer.complete {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent-emerald-light);
          }

          .status-footer.error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--accent-red-light);
          }
        `}</style>

        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title">
            <List size={18} />
            <span>Execution Trace</span>
          </div>
          <div className="inspector-actions">
            <button
              onClick={toggleTraceList}
              className="inspector-btn"
              title="Hide panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="empty-state">
          <List size={32} />
          <p className="empty-state-title">No trace yet</p>
          <p className="empty-state-hint">Run simulation to see execution history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trace-list-panel">
      <style>{`
        .trace-list-panel {
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
          color: var(--accent-emerald);
        }

        .step-count {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
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

        .trace-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0;
        }

        .status-footer {
          padding: var(--space-4);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 500;
        }

        .status-footer.complete {
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-emerald-light);
        }

        .status-footer.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red-light);
        }
      `}</style>

      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title">
          <List size={18} />
          <span>Execution Trace</span>
          <span className="step-count">
            {executionTrace.steps.length} steps
          </span>
        </div>
        <div className="inspector-actions">
          <button
            onClick={toggleTraceList}
            className="inspector-btn"
            title="Hide panel"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Trace list */}
      <div className="trace-list">
        {executionTrace.steps.map((step, index) => (
          <TraceStepItem
            key={index}
            step={step}
            index={index}
            isActive={index === trace.currentStep}
            onClick={() => jumpToStep(index)}
          />
        ))}
      </div>

      {/* Final state indicator */}
      {trace.status === 'complete' && (
        <div className="status-footer complete">
          Simulation complete
        </div>
      )}

      {trace.status === 'error' && trace.error && (
        <div className="status-footer error">
          {trace.error}
        </div>
      )}
    </div>
  );
}
