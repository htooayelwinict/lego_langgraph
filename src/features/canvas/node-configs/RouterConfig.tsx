interface RouterConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function RouterConfig({ config, onChange }: RouterConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-form">
      <h3 className="config-form-title">Router Configuration</h3>

      {/* Condition Expression */}
      <div className="config-field">
        <label className="config-label">Default Condition</label>
        <textarea
          value={(config.condition as string) || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="config-textarea mono"
          placeholder='state.tool_result === "success"'
          rows={3}
        />
        <p className="config-hint">
          Expression to evaluate. Use <code>state.field</code> for state access.
        </p>
      </div>

      {/* Routing Mode */}
      <div className="config-field">
        <label className="config-label">Routing Mode</label>
        <select
          value={(config.routingMode as string) || 'condition'}
          onChange={(e) => handleChange('routingMode', e.target.value)}
          className="config-select"
        >
          <option value="condition">Conditional</option>
          <option value="enum">Enum Value</option>
          <option value="function">Function Call</option>
        </select>
      </div>

      {/* Target Field (for enum routing) */}
      {(config.routingMode as string) === 'enum' && (
        <div className="config-field">
          <label className="config-label">State Field to Route On</label>
          <input
            type="text"
            value={(config.targetField as string) || ''}
            onChange={(e) => handleChange('targetField', e.target.value)}
            className="config-input mono"
            placeholder="status"
          />
          <p className="config-hint">
            Each edge should have a condition matching one of the enum values
          </p>
        </div>
      )}
    </div>
  );
}
