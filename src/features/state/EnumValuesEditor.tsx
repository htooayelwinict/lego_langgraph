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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Enum Values <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Value ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeValue(index)}
              disabled={values.length <= 1}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              title="Remove value"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addValue}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Value
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {values.length} value{values.length !== 1 ? 's' : ''} defined
      </p>
    </div>
  );
}
