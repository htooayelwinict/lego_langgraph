interface RouterConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function RouterConfig({ config, onChange }: RouterConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Router Configuration</h3>

      {/* Condition Expression */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Default Condition
        </label>
        <textarea
          value={(config.condition as string) || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder='state.tool_result === "success"'
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Expression to evaluate. Use <code className="bg-gray-100 px-1 rounded">state.field</code> for state access.
        </p>
      </div>

      {/* Routing Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Routing Mode
        </label>
        <select
          value={(config.routingMode as string) || 'condition'}
          onChange={(e) => handleChange('routingMode', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="condition">Conditional</option>
          <option value="enum">Enum Value</option>
          <option value="function">Function Call</option>
        </select>
      </div>

      {/* Target Field (for enum routing) */}
      {(config.routingMode as string) === 'enum' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State Field to Route On
          </label>
          <input
            type="text"
            value={(config.targetField as string) || ''}
            onChange={(e) => handleChange('targetField', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            placeholder="status"
          />
          <p className="text-xs text-gray-500 mt-1">
            Each edge should have a condition matching one of the enum values
          </p>
        </div>
      )}
    </div>
  );
}
