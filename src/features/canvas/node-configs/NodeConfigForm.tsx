import { NodeType } from '@/models/graph';
import { LLMConfig } from './LLMConfig';
import { ToolConfig } from './ToolConfig';
import { RouterConfig } from './RouterConfig';
import { ReducerConfig } from './ReducerConfig';
import { LoopGuardConfig } from './LoopGuardConfig';

interface NodeConfigFormProps {
  nodeType: NodeType;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function NodeConfigForm({ nodeType, config, onChange }: NodeConfigFormProps) {
  switch (nodeType) {
    case 'LLM':
      return <LLMConfig config={config} onChange={onChange} />;

    case 'Tool':
      return <ToolConfig config={config} onChange={onChange} />;

    case 'Router':
      return <RouterConfig config={config} onChange={onChange} />;

    case 'Reducer':
      return <ReducerConfig config={config} onChange={onChange} />;

    case 'LoopGuard':
      return <LoopGuardConfig config={config} onChange={onChange} />;

    case 'Start':
    case 'End':
    default:
      return (
        <div className="text-sm text-gray-500 text-center py-8">
          No configuration options for this node type.
        </div>
      );
  }
}
