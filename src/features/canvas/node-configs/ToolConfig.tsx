interface ToolConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ToolConfig({ config, onChange }: ToolConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Tool Configuration</h3>

      {/* Tool Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tool Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={(config.toolName as string) || ''}
          onChange={(e) => handleChange('toolName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder="search"
        />
        <p className="text-xs text-gray-500 mt-1">
          The name of the tool/function to call
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={(config.description as string) || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Search the web for current information"
          rows={3}
        />
      </div>

      {/* Parameters (JSON) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parameters Schema (JSON)
        </label>
        <textarea
          value={(config.parameters as string) || ''}
          onChange={(e) => handleChange('parameters', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          placeholder='{"query": {"type": "string"}}'
          rows={5}
        />
        <p className="text-xs text-gray-500 mt-1">
          JSON Schema describing the tool parameters
        </p>
      </div>
    </div>
  );
}
