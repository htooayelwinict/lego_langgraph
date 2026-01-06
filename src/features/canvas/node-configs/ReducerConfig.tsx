interface ReducerConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ReducerConfig({ config, onChange }: ReducerConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-form">
      <h3 className="config-form-title">Reducer Configuration</h3>

      {/* Target Field */}
      <div className="config-field">
        <label className="config-label">Target State Field</label>
        <input
          type="text"
          value={(config.targetField as string) || ''}
          onChange={(e) => handleChange('targetField', e.target.value)}
          className="config-input mono"
          placeholder="messages"
        />
        <p className="config-hint">The state field to update with reduced values</p>
      </div>

      {/* Merge Strategy */}
      <div className="config-field">
        <label className="config-label">Merge Strategy</label>
        <select
          value={(config.strategy as string) || 'append'}
          onChange={(e) => handleChange('strategy', e.target.value)}
          className="config-select"
        >
          <option value="append">Append (add to array)</option>
          <option value="prepend">Prepend (add to start)</option>
          <option value="merge">Merge (deep merge objects)</option>
          <option value="replace">Replace (last value wins)</option>
          <option value="sum">Sum (numeric aggregation)</option>
        </select>
      </div>

      {/* Initial Value (optional) */}
      <div className="config-field">
        <label className="config-label">Initial Value (JSON)</label>
        <textarea
          value={(config.initialValue as string) || ''}
          onChange={(e) => handleChange('initialValue', e.target.value)}
          className="config-textarea mono"
          placeholder="[]"
          rows={2}
        />
        <p className="config-hint">Optional: Starting value for the reduction</p>
      </div>
    </div>
  );
}
