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

  return (
    <div className="group bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        {/* Field Info */}
        <div className="flex-1 min-w-0" onClick={onEdit}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-medium text-gray-900 truncate">
              {field.key}
            </span>
            {field.required && (
              <span title="Required">
                <Asterisk className="w-3 h-3 text-red-500 shrink-0" />
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor} shrink-0`}>
              {field.type}
            </span>
          </div>

          {/* Default value */}
          <div className="text-xs text-gray-500 mb-1">
            Default: <code className="bg-gray-200 px-1 rounded">{formatDefaultValue(field.default, field.type)}</code>
          </div>

          {/* Description */}
          {field.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{field.description}</p>
          )}

          {/* Enum values */}
          {field.type === 'enum' && field.enumValues && field.enumValues.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {field.enumValues.map((val) => (
                <span
                  key={val}
                  className="text-xs bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded border border-pink-200"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit field"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
