interface ReducerConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ReducerConfig({ config, onChange }: ReducerConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Reducer Configuration</h3>

      {/* Target Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target State Field
        </label>
        <input
          type="text"
          value={(config.targetField as string) || ''}
          onChange={(e) => handleChange('targetField', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder="messages"
        />
        <p className="text-xs text-gray-500 mt-1">
          The state field to update with reduced values
        </p>
      </div>

      {/* Merge Strategy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Merge Strategy
        </label>
        <select
          value={(config.strategy as string) || 'append'}
          onChange={(e) => handleChange('strategy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="append">Append (add to array)</option>
          <option value="prepend">Prepend (add to start)</option>
          <option value="merge">Merge (deep merge objects)</option>
          <option value="replace">Replace (last value wins)</option>
          <option value="sum">Sum (numeric aggregation)</option>
        </select>
      </div>

      {/* Initial Value (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Initial Value (JSON)
        </label>
        <textarea
          value={(config.initialValue as string) || ''}
          onChange={(e) => handleChange('initialValue', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder="[]"
          rows={2}
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Starting value for the reduction
        </p>
      </div>
    </div>
  );
}
