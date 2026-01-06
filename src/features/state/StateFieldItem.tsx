import { StateField, FieldType } from '@/models/state';
import { Trash2, Edit, Asterisk } from 'lucide-react';
import { useStateStore } from '@/store/stateStore';

interface StateFieldItemProps {
  field: StateField;
  typeColor: string;
  onEdit: () => void;
}

function formatDefaultValue(value: unknown, type: FieldType): string {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (type === 'array' && Array.isArray(value)) return `[]`;
  if (type === 'object' && typeof value === 'object') return '{}';
  if (type === 'boolean') return String(value);
  return String(value);
}

export function StateFieldItem({ field, typeColor, onEdit }: StateFieldItemProps) {
  const { deleteField } = useStateStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete field "${field.key}"?`)) {
      deleteField(field.key);
    }
  };

  // Parse typeColor to extract bg and text colors
  const [bgColor, textColor] = typeColor.split(' ');

  return (
    <div className="state-field-item" onClick={onEdit}>
      <style>{`
        .state-field-item {
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .state-field-item:hover {
          border-color: var(--border-default);
          background: var(--bg-elevated);
        }

        .state-field-item:hover .field-actions {
          opacity: 1;
        }

        .field-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-2);
        }

        .field-info {
          flex: 1;
          min-width: 0;
        }

        .field-key-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-1);
        }

        .field-key {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .required-icon {
          color: var(--accent-red);
          flex-shrink: 0;
        }

        .type-badge {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .field-default {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }

        .field-default code {
          background: var(--bg-elevated);
          padding: 1px 4px;
          border-radius: 3px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }

        .field-description {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .enum-values {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: var(--space-2);
        }

        .enum-value {
          font-size: 10px;
          padding: 2px 6px;
          background: rgba(236, 72, 153, 0.15);
          color: #f472b6;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .field-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .field-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .field-action-btn:hover {
          background: var(--bg-glass-light);
          color: var(--text-primary);
        }

        .field-action-btn.edit:hover {
          color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.15);
        }

        .field-action-btn.delete:hover {
          color: var(--accent-red-light);
          background: rgba(239, 68, 68, 0.15);
        }
      `}</style>

      <div className="field-header">
        {/* Field Info */}
        <div className="field-info">
          <div className="field-key-row">
            <span className="field-key">{field.key}</span>
            {field.required && (
              <span className="required-icon" title="Required">
                <Asterisk size={12} />
              </span>
            )}
            <span
              className="type-badge"
              style={{
                background: bgColor,
                color: textColor
              }}
            >
              {field.type}
            </span>
          </div>

          {/* Default value */}
          <div className="field-default">
            Default: <code>{formatDefaultValue(field.default, field.type)}</code>
          </div>

          {/* Description */}
          {field.description && (
            <p className="field-description">{field.description}</p>
          )}

          {/* Enum values */}
          {field.type === 'enum' && field.enumValues && field.enumValues.length > 0 && (
            <div className="enum-values">
              {field.enumValues.map((val) => (
                <span key={val} className="enum-value">
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="field-actions">
          <button
            onClick={onEdit}
            className="field-action-btn edit"
            title="Edit field"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="field-action-btn delete"
            title="Delete field"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
