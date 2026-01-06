import { useGraphStore } from '@/store/graphStore';
import { useUiStore } from '@/store/uiStore';
import { Settings, Trash2, Link2 } from 'lucide-react';

export function EdgeInspector() {
  const { nodes, edges, selectedEdgeId, updateEdge, deleteEdge } = useGraphStore();
  const { showInspector, toggleInspector } = useUiStore();

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  // Get source and target nodes for context
  const sourceNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.source)
    : null;
  const targetNode = selectedEdge
    ? nodes.find((n) => n.id === selectedEdge.target)
    : null;

  // Check if source is a Router or LoopGuard (these support edge conditions)
  const isConditionalSource =
    sourceNode?.data.type === 'Router' || sourceNode?.data.type === 'LoopGuard';

  // Don't show if no edge selected or panel is hidden
  if (!selectedEdge || !showInspector) {
    return null;
  }

  const edgeData = selectedEdge.data || {};

  const handleLabelChange = (label: string) => {
    updateEdge(selectedEdgeId!, { ...edgeData, label });
  };

  const handleConditionChange = (condition: string) => {
    updateEdge(selectedEdgeId!, { ...edgeData, condition });
  };

  const handleDelete = () => {
    if (confirm(`Delete edge from "${sourceNode?.data.label}" to "${targetNode?.data.label}"?`)) {
      deleteEdge(selectedEdgeId!);
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Edge Inspector</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
            title="Delete edge"
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

      {/* Connection Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">{sourceNode?.data.label}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium text-gray-700">{targetNode?.data.label}</span>
        </div>
        {isConditionalSource && (
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Conditional edge: source node type supports conditions
          </div>
        )}
      </div>

      {/* Label */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={edgeData.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Edge label (optional)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Displayed on the edge in the canvas
        </p>
      </div>

      {/* Condition (only for Router/LoopGuard sources) */}
      {isConditionalSource && (
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <textarea
            value={(edgeData.condition as string) || ''}
            onChange={(e) => handleConditionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            placeholder={sourceNode?.data.type === 'Router' ? 'state.status === "success"' : 'state.iterations < 10'}
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            {sourceNode?.data.type === 'Router'
              ? 'Condition to determine if this path is taken. Use state.field for state access.'
              : 'Loop continuation condition. True = continue loop, False = exit loop.'}
          </p>

          {/* Condition Syntax Help */}
          <details className="mt-3">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
              Condition syntax help
            </summary>
            <div className="mt-2 p-3 bg-blue-50 rounded text-xs text-blue-800 space-y-1">
              <p><strong>State access:</strong> <code>state.field_name</code></p>
              <p><strong>Comparisons:</strong> <code>===</code>, <code>!==</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></p>
              <p><strong>Logic:</strong> <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not)</p>
              <p><strong>Examples:</strong></p>
              <ul className="ml-4 list-disc">
                <li><code>state.count &gt; 5</code></li>
                <li><code>state.status === "success"</code></li>
                <li><code>state.items.length === 0</code></li>
              </ul>
            </div>
          </details>
        </div>
      )}

      {/* Info Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">About Edge Conditions</p>
          <p className="mb-2">
            {isConditionalSource
              ? `This edge originates from a ${sourceNode?.data.type} node, which supports conditional routing. The condition determines when this path is taken during simulation.`
              : `This edge connects two nodes directly. The source node type (${sourceNode?.data.type}) doesn't support conditional routing.`}
          </p>
          {!isConditionalSource && (
            <p className="text-xs text-gray-500">
              Add a Router or Loop Guard node before this edge to enable conditional routing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
