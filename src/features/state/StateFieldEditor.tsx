import { useState, useEffect } from 'react';
import { X, Database } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useStateStore } from '@/store/stateStore';
import { StateField, FieldType } from '@/models/state';
import { EnumValuesEditor } from './EnumValuesEditor';

const FIELD_TYPES: { value: FieldType; label: string; color: string }[] = [
  { value: 'string', label: 'String', color: '#60a5fa' },
  { value: 'number', label: 'Number', color: '#34d399' },
  { value: 'boolean', label: 'Boolean', color: '#a78bfa' },
  { value: 'array', label: 'Array', color: '#fbbf24' },
  { value: 'object', label: 'Object', color: '#94a3b8' },
  { value: 'enum', label: 'Enum', color: '#f472b6' },
];

export function StateFieldEditor() {
  const { activeModal, editingFieldKey, closeModal } = useUiStore();
  const { schema, addField, updateField } = useStateStore();

  const isOpen = activeModal === 'state-field-editor';
  const isEditing = editingFieldKey !== null;

  // Find existing field if editing
  const existingField = schema.fields.find((f) => f.key === editingFieldKey);

  // Form state
  const [key, setKey] = useState(existingField?.key || '');
  const [type, setType] = useState<FieldType>(existingField?.type || 'string');
  const [required, setRequired] = useState(existingField?.required || false);
  const [description, setDescription] = useState(existingField?.description || '');
  const [defaultJSON, setDefaultJSON] = useState(
    existingField?.default !== undefined
      ? JSON.stringify(existingField.default, null, 2)
      : ''
  );
  const [enumValues, setEnumValues] = useState<string[]>(
    existingField?.enumValues || []
  );
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingField) {
        setKey(existingField.key);
        setType(existingField.type);
        setRequired(existingField.required || false);
        setDescription(existingField.description || '');
        setDefaultJSON(
          existingField.default !== undefined
            ? JSON.stringify(existingField.default, null, 2)
            : ''
        );
        setEnumValues(existingField.enumValues || []);
      } else {
        setKey('');
        setType('string');
        setRequired(false);
        setDescription('');
        setDefaultJSON('');
        setEnumValues([]);
      }
      setError(null);
    }
  }, [isOpen, existingField]);

  if (!isOpen) return null;

  const getDefaultForType = (fieldType: FieldType): unknown => {
    switch (fieldType) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      case 'enum':
        return enumValues[0] || '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate key
    if (!key.trim()) {
      setError('Field key is required');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      setError('Invalid key: must start with letter/underscore and contain only letters, numbers, underscores');
      return;
    }

    // Check for duplicate keys (only when adding, or when changing key on edit)
    const duplicate = schema.fields.some(
      (f) => f.key === key && f.key !== editingFieldKey
    );
    if (duplicate) {
      setError('Field key already exists');
      return;
    }

    // Validate required fields have defaults
    if (required && !defaultJSON.trim()) {
      setError('Required fields must have a default value');
      return;
    }

    // Validate enum has values
    if (type === 'enum' && enumValues.length === 0) {
      setError('Enum fields must have at least one value');
      return;
    }

    // Parse default value
    let defaultValue: unknown = undefined;
    if (defaultJSON.trim()) {
      try {
        defaultValue = JSON.parse(defaultJSON);

        // Type validation
        switch (type) {
          case 'string':
            if (typeof defaultValue !== 'string') {
              setError('Default value must be a string');
              return;
            }
            break;
          case 'number':
            if (typeof defaultValue !== 'number') {
              setError('Default value must be a number');
              return;
            }
            break;
          case 'boolean':
            if (typeof defaultValue !== 'boolean') {
              setError('Default value must be a boolean');
              return;
            }
            break;
          case 'array':
            if (!Array.isArray(defaultValue)) {
              setError('Default value must be an array');
              return;
            }
            break;
          case 'object':
            if (typeof defaultValue !== 'object' || defaultValue === null || Array.isArray(defaultValue)) {
              setError('Default value must be an object');
              return;
            }
            break;
          case 'enum':
            if (typeof defaultValue !== 'string' || !enumValues.includes(defaultValue)) {
              setError('Default value must be one of the enum values');
              return;
            }
            break;
        }
      } catch {
        setError('Invalid JSON in default value');
        return;
      }
    } else if (required) {
      defaultValue = getDefaultForType(type);
    }

    const field: StateField = {
      key: key.trim(),
      type,
      required,
      description: description.trim() || undefined,
      default: defaultValue,
      enumValues: type === 'enum' ? enumValues : undefined,
    };

    if (isEditing) {
      updateField(editingFieldKey!, field);
    } else {
      addField(field);
    }

    closeModal();
  };

  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: var(--space-4);
        }

        .modal-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 480px;
          max-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-title svg {
          color: var(--accent-purple);
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-5);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-error {
          padding: var(--space-3);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--accent-red-light);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-label .required {
          color: var(--accent-red);
          margin-left: 2px;
        }

        .form-input {
          width: 100%;
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          transition: all var(--transition-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-input.mono {
          font-family: var(--font-mono);
        }

        .form-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        .form-select {
          width: 100%;
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .form-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .form-select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-checkbox-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .form-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-blue);
          cursor: pointer;
        }

        .form-checkbox-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .form-textarea {
          width: 100%;
          padding: var(--space-3);
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          min-height: 60px;
          transition: all var(--transition-fast);
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .form-textarea::placeholder {
          color: var(--text-muted);
        }

        .form-textarea.mono {
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .modal-footer {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }

        .btn {
          flex: 1;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .btn-primary {
          background: var(--gradient-primary);
          border: none;
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md), var(--shadow-glow-blue);
        }
      `}</style>

      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Database size={20} />
            <span>{isEditing ? 'Edit Field' : 'Add Field'}</span>
          </div>
          <button onClick={closeModal} className="modal-close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form" id="field-form">
            {/* Error */}
            {error && <div className="form-error">{error}</div>}

            {/* Key */}
            <div className="form-field">
              <label className="form-label">
                Field Key <span className="required">*</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="form-input mono"
                placeholder="my_field"
                disabled={isEditing}
              />
              <p className="form-hint">
                Valid JavaScript identifier (letters, numbers, underscore)
              </p>
            </div>

            {/* Type */}
            <div className="form-field">
              <label className="form-label">
                Type <span className="required">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FieldType)}
                className="form-select"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Required */}
            <div className="form-checkbox-row">
              <input
                type="checkbox"
                id="required"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="required" className="form-checkbox-label">
                Required field
              </label>
            </div>

            {/* Default Value */}
            <div className="form-field">
              <label className="form-label">
                Default Value {required && <span className="required">*</span>}
                {type === 'enum' && (
                  <span style={{ fontWeight: 400, marginLeft: '8px' }}>(one of the enum values)</span>
                )}
              </label>
              <textarea
                value={defaultJSON}
                onChange={(e) => setDefaultJSON(e.target.value)}
                className="form-textarea mono"
                placeholder={type === 'string' ? '"text"' : type === 'number' ? '0' : '[]'}
                rows={2}
              />
              <p className="form-hint">
                Enter as JSON (e.g., &quot;hello&quot;, 42, true, [], {'{'}{'}'})
              </p>
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                placeholder="What this field represents..."
                rows={2}
              />
            </div>

            {/* Enum Values */}
            {type === 'enum' && (
              <EnumValuesEditor values={enumValues} onChange={setEnumValues} />
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" form="field-form" className="btn btn-primary">
            {isEditing ? 'Save Changes' : 'Add Field'}
          </button>
        </div>
      </div>
    </div>
  );
}
