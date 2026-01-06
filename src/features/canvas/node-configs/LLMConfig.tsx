interface LLMConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function LLMConfig({ config, onChange }: LLMConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">LLM Configuration</h3>

      {/* Prompt Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prompt Template
        </label>
        <textarea
          value={(config.prompt as string) || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder="You are a helpful assistant. Answer: {input}"
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use {'{state_field}'} for state variable interpolation
        </p>
      </div>

      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Name
        </label>
        <input
          type="text"
          value={(config.modelName as string) || ''}
          onChange={(e) => handleChange('modelName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="gpt-4"
        />
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Temperature
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={(config.temperature as number) ?? 0.7}
          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          0 = deterministic, 2 = creative
        </p>
      </div>
    </div>
  );
}
