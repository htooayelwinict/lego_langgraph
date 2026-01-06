import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './nodes';
import { ConditionEdge } from './edges';
import { useGraphStore } from '@/store/graphStore';
import { NodePalette } from './NodePalette';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  default: ConditionEdge,
};

export function CanvasView() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setSelectedEdge,
  } = useGraphStore();

  // Handle node selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: { id: string }) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  // Handle edge selection
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: { id: string }) => {
    setSelectedEdge(edge.id);
  }, [setSelectedEdge]);

  // Handle background click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const { selectedNodeId, selectedEdgeId, deleteNode, deleteEdge } = useGraphStore.getState();
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        }
        if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedNode, setSelectedEdge]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* Node palette sidebar */}
      <NodePalette />

      {/* Main canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          nodeDragThreshold={2}
          selectNodesOnDrag={false}
          onlyRenderVisibleElements
          fitView
          defaultEdgeOptions={{
            type: 'default',
            animated: false,
          }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                Start: '#3b82f6',
                LLM: '#22c55e',
                Tool: '#eab308',
                Router: '#f59e0b',
                Reducer: '#a855f7',
                LoopGuard: '#ec4899',
                End: '#ef4444',
              };
              return colors[node.data.type] || '#94a3b8';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
