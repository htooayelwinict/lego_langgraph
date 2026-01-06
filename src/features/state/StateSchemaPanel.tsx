import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStateStore } from '@/store/stateStore';
import { useUiStore } from '@/store/uiStore';
import { Plus, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { StateFieldItem } from './StateFieldItem';
import { FieldType } from '@/models/state';

const FIELD_TYPE_COLORS: Record<FieldType, { bg: string; text: string }> = {
  string: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' },
  number: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' },
  boolean: { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa' },
  array: { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24' },
  object: { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' },
  enum: { bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6' },
};

export function StateSchemaPanel() {
  const { schema, errors } = useStateStore();
  const { showStatePanel, toggleStatePanel, openModal } = useUiStore();

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: schema.fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
  });

  if (!showStatePanel) {
    return (
      <div className="state-panel-collapsed">
        <style>{`
          .state-panel-collapsed {
            position: relative;
            width: 100%;
            height: 100%;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border-subtle);
          }
          .panel-toggle-btn {
            position: absolute;
            right: -16px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 15;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 64px;
            background: var(--bg-glass);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border-subtle);
            border-left: none;
            border-radius: 0 var(--radius-md) var(--radius-md) 0;
            color: var(--text-muted);
            cursor: pointer;
            transition: all var(--transition-fast);
          }
          .panel-toggle-btn:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
          }
          .collapsed-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: var(--space-3);
            color: var(--text-muted);
          }
          .collapsed-content svg {
            opacity: 0.4;
          }
          .collapsed-label {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
        `}</style>
        <div className="collapsed-content">
          <Database size={20} />
          <span className="collapsed-label">State Schema</span>
        </div>
        <button
          onClick={toggleStatePanel}
          className="panel-toggle-btn"
          title="Show State Panel"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="state-panel">
      <style>{`
        .state-panel {
          position: relative;
          width: 100%;
          height: 100%;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .state-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .state-panel-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .state-panel-title svg {
          color: var(--accent-purple);
        }

        .state-panel-close {
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

        .state-panel-close:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .error-banner {
          margin: var(--space-4);
          margin-bottom: 0;
          padding: var(--space-3);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .error-banner-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent-red-light);
          margin-bottom: var(--space-2);
        }

        .error-banner-list {
          list-style: none;
          font-size: 11px;
          color: var(--accent-red-light);
          opacity: 0.9;
        }

        .error-banner-list li {
          margin-bottom: var(--space-1);
        }

        .field-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-4);
          min-height: 0;
        }

        .field-list-container {
          position: relative;
          width: 100%;
        }

        .field-list-item {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding-bottom: var(--space-2);
        }

        .empty-fields {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          text-align: center;
          color: var(--text-muted);
        }

        .empty-fields svg {
          width: 40px;
          height: 40px;
          margin-bottom: var(--space-3);
          opacity: 0.4;
        }

        .empty-fields p {
          font-size: 13px;
          line-height: 1.5;
        }

        .add-field-section {
          padding: var(--space-4);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .add-field-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .add-field-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md), var(--shadow-glow-blue);
        }
      `}</style>

      {/* Header */}
      <div className="state-panel-header">
        <div className="state-panel-title">
          <Database size={18} />
          <span>State Schema</span>
        </div>
        <button
          onClick={toggleStatePanel}
          className="state-panel-close"
          title="Hide panel"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="error-banner">
          <p className="error-banner-title">Validation Errors</p>
          <ul className="error-banner-list">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Field List */}
      <div ref={parentRef} className="field-list">
        {schema.fields.length === 0 ? (
          <div className="empty-fields">
            <Database />
            <p>No fields defined yet.<br />Add your first state field.</p>
          </div>
        ) : (
          <div className="field-list-container" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const field = schema.fields[virtualRow.index];
              if (!field) return null;
              const typeColor = FIELD_TYPE_COLORS[field.type];
              return (
                <div
                  key={field.key}
                  className="field-list-item"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <StateFieldItem
                    field={field}
                    typeColor={`${typeColor.bg} ${typeColor.text}`}
                    onEdit={() => openModal('state-field-editor', field.key)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Field Button */}
      <div className="add-field-section">
        <button
          onClick={() => openModal('state-field-editor')}
          className="add-field-btn"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>
    </div>
  );
}
