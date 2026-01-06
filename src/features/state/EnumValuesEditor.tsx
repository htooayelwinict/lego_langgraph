import { Plus, X } from 'lucide-react';

interface EnumValuesEditorProps {
  values: string[];
  onChange: (values: string[]) => void;
}

export function EnumValuesEditor({ values, onChange }: EnumValuesEditorProps) {
  const addValue = () => {
    onChange([...values, '']);
  };

  const updateValue = (index: number, newValue: string) => {
    const updated = [...values];
    updated[index] = newValue;
    onChange(updated);
  };

  const removeValue = (index: number) => {
    if (values.length <= 1) return; // Keep at least one value
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="enum-editor">
      <style>{`
        .enum-editor {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .enum-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .enum-label .required {
          color: var(--accent-red);
          margin-left: 2px;
        }

        .enum-values-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .enum-value-row {
          display: flex;
          gap: var(--space-2);
        }

        .enum-value-input {
          flex: 1;
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .enum-value-input:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .enum-value-input::placeholder {
          color: var(--text-muted);
        }

        .enum-remove-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .enum-remove-btn:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--accent-red-light);
        }

        .enum-remove-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .enum-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          background: transparent;
          border: 1px dashed var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 13px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .enum-add-btn:hover {
          background: var(--bg-elevated);
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .enum-count {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>

      <label className="enum-label">
        Enum Values <span className="required">*</span>
      </label>
      <div className="enum-values-list">
        {values.map((value, index) => (
          <div key={index} className="enum-value-row">
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(index, e.target.value)}
              className="enum-value-input"
              placeholder={`Value ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeValue(index)}
              disabled={values.length <= 1}
              className="enum-remove-btn"
              title="Remove value"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <button type="button" onClick={addValue} className="enum-add-btn">
          <Plus size={16} />
          Add Value
        </button>
      </div>
      <p className="enum-count">
        {values.length} value{values.length !== 1 ? 's' : ''} defined
      </p>
    </div>
  );
}
