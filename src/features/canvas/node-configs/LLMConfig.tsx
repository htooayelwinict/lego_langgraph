interface LLMConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function LLMConfig({ config, onChange }: LLMConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-form">
      <h3 className="config-form-title">LLM Configuration</h3>

      {/* Prompt Template */}
      <div className="config-field">
        <label className="config-label">Prompt Template</label>
        <textarea
          value={(config.prompt as string) || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
          className="config-textarea mono"
          placeholder="You are a helpful assistant. Answer: {input}"
          rows={6}
        />
        <p className="config-hint">
          Use <code>{'{state_field}'}</code> for state variable interpolation
        </p>
      </div>

      {/* Model Name */}
      <div className="config-field">
        <label className="config-label">Model Name</label>
        <input
          type="text"
          value={(config.modelName as string) || ''}
          onChange={(e) => handleChange('modelName', e.target.value)}
          className="config-input"
          placeholder="gpt-4"
        />
      </div>

      {/* Temperature */}
      <div className="config-field">
        <label className="config-label">Temperature</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="2"
          value={(config.temperature as number) ?? 0.7}
          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          className="config-input"
        />
        <p className="config-hint">0 = deterministic, 2 = creative</p>
      </div>
    </div>
  );
}
