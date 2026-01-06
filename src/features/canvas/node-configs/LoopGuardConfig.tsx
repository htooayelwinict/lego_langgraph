interface LoopGuardConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function LoopGuardConfig({ config, onChange }: LoopGuardConfigProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-form">
      <h3 className="config-form-title">Loop Guard Configuration</h3>

      {/* Exit Condition */}
      <div className="config-field">
        <label className="config-label">Exit Condition</label>
        <textarea
          value={(config.condition as string) || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="config-textarea mono"
          placeholder='state.iterations >= 10 || state.done === true'
          rows={3}
        />
        <p className="config-hint">
          When true, exits the loop and follows the "exit" edge. Otherwise, continues looping.
        </p>
      </div>

      {/* Max Iterations */}
      <div className="config-field">
        <label className="config-label">Max Iterations (Safety Limit)</label>
        <input
          type="number"
          min="1"
          value={(config.maxIterations as number) || 10}
          onChange={(e) => handleChange('maxIterations', parseInt(e.target.value) || 10)}
          className="config-input"
        />
        <p className="config-hint">Hard limit to prevent infinite loops</p>
      </div>

      {/* Counter Field */}
      <div className="config-field">
        <label className="config-label">Counter State Field</label>
        <input
          type="text"
          value={(config.counterField as string) || ''}
          onChange={(e) => handleChange('counterField', e.target.value)}
          className="config-input mono"
          placeholder="iterations"
        />
        <p className="config-hint">Optional: State field to track iteration count</p>
      </div>
    </div>
  );
}
