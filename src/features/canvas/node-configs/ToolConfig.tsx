interface ToolConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ToolConfig({ config, onChange }: ToolConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-form">
      <h3 className="config-form-title">Tool Configuration</h3>

      {/* Tool Name */}
      <div className="config-field">
        <label className="config-label">
          Tool Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={(config.toolName as string) || ''}
          onChange={(e) => handleChange('toolName', e.target.value)}
          className="config-input mono"
          placeholder="search"
        />
        <p className="config-hint">The name of the tool/function to call</p>
      </div>

      {/* Description */}
      <div className="config-field">
        <label className="config-label">Description</label>
        <textarea
          value={(config.description as string) || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="config-textarea"
          placeholder="Search the web for current information"
          rows={3}
        />
      </div>

      {/* Parameters (JSON) */}
      <div className="config-field">
        <label className="config-label">Parameters Schema (JSON)</label>
        <textarea
          value={(config.parameters as string) || ''}
          onChange={(e) => handleChange('parameters', e.target.value)}
          className="config-textarea mono"
          placeholder='{"query": {"type": "string"}}'
          rows={5}
        />
        <p className="config-hint">JSON Schema describing the tool parameters</p>
      </div>
    </div>
  );
}
