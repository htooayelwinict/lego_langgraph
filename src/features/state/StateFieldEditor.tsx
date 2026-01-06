import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useStateStore } from '@/store/stateStore';
import { StateField, FieldType } from '@/models/state';
import { EnumValuesEditor } from './EnumValuesEditor';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
  { value: 'enum', label: 'Enum' },
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Field' : 'Add Field'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="my_field"
              disabled={isEditing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Valid JavaScript identifier (letters, numbers, underscore)
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Required */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700">
              Required field
            </label>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Value {required && <span className="text-red-500">*</span>}
              {type === 'enum' && (
                <span className="text-xs text-gray-500">(one of the enum values)</span>
              )}
            </label>
            <textarea
              value={defaultJSON}
              onChange={(e) => setDefaultJSON(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={type === 'string' ? '"text"' : type === 'number' ? '0' : '[]'}
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter as JSON (e.g., &quot;hello&quot;, 42, true, [], {'{'}{'}'})
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="What this field represents..."
              rows={2}
            />
          </div>

          {/* Enum Values */}
          {type === 'enum' && (
            <EnumValuesEditor values={enumValues} onChange={setEnumValues} />
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
