import { useGraphStore } from '@/store/graphStore';
import { useUiStore } from '@/store/uiStore';
import { Settings, Trash2 } from 'lucide-react';
import { NodeConfigForm } from './node-configs/NodeConfigForm';
import { NodeType } from '@/models/graph';

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  Start: 'Start Node',
  LLM: 'LLM Node',
  Tool: 'Tool Node',
  Router: 'Router Node',
  Reducer: 'Reducer Node',
  LoopGuard: 'Loop Guard',
  End: 'End Node',
};

export function NodeInspector() {
  const { nodes, selectedNodeId, updateNode, deleteNode } = useGraphStore();
  const { showInspector, toggleInspector } = useUiStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Don't show if no node selected or panel is hidden
  if (!selectedNode || !showInspector) {
    return null;
  }

  const nodeType = selectedNode.data.type as NodeType;

  const handleLabelChange = (label: string) => {
    updateNode(selectedNodeId!, { label });
  };

  const handleConfigChange = (config: Record<string, unknown>) => {
    updateNode(selectedNodeId!, { config });
  };

  const handleDelete = () => {
    if (confirm(`Delete "${selectedNode.data.label}" node?`)) {
      deleteNode(selectedNodeId!);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Node Inspector</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleInspector}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            title="Hide panel"
          >
            <Settings className="w-4 h-4 -scale-x-100" />
          </button>
        </div>
      </div>

      {/* Node Type Badge */}
      <div className="px-4 pt-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {NODE_TYPE_LABELS[nodeType]}
        </span>
      </div>

      {/* Label Editor */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Node label"
        />
      </div>

      {/* Node-specific Config */}
      <div className="flex-1 overflow-y-auto p-4">
        <NodeConfigForm
          nodeType={nodeType}
          config={selectedNode.data.config || {}}
          onChange={handleConfigChange}
        />
      </div>
    </div>
  );
}
