interface LoopGuardConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function LoopGuardConfig({ config, onChange }: LoopGuardConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Loop Guard Configuration</h3>

      {/* Exit Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Exit Condition
        </label>
        <textarea
          value={(config.condition as string) || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder='state.iterations >= 10 || state.done === true'
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          When true, exits the loop and follows the "exit" edge. Otherwise, continues looping.
        </p>
      </div>

      {/* Max Iterations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Iterations (Safety Limit)
        </label>
        <input
          type="number"
          min="1"
          value={(config.maxIterations as number) || 10}
          onChange={(e) => handleChange('maxIterations', parseInt(e.target.value) || 10)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Hard limit to prevent infinite loops
        </p>
      </div>

      {/* Counter Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Counter State Field
        </label>
        <input
          type="text"
          value={(config.counterField as string) || ''}
          onChange={(e) => handleChange('counterField', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder="iterations"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: State field to track iteration count
        </p>
      </div>
    </div>
  );
}
