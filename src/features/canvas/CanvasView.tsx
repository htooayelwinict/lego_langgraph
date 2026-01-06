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
        // Don't delete if user is typing in an input field
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }

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
    <div className="canvas-container">
      <style>{`
        .canvas-container {
          width: 100%;
          height: 100%;
          display: flex;
          background: var(--bg-primary);
        }

        .canvas-main {
          flex: 1;
          position: relative;
        }

        /* ReactFlow Controls Styling */
        .react-flow__controls {
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .react-flow__controls-button {
          background: transparent;
          border-bottom: 1px solid var(--border-subtle);
          fill: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .react-flow__controls-button:hover {
          background: var(--bg-glass-light);
          fill: var(--text-primary);
        }

        .react-flow__controls-button:last-child {
          border-bottom: none;
        }

        /* MiniMap Styling */
        .react-flow__minimap {
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
        }

        .react-flow__minimap-mask {
          fill: rgba(15, 23, 42, 0.6);
        }

        /* Edge Styling */
        .react-flow__edge-path {
          stroke: var(--text-muted);
          stroke-width: 2;
        }

        .react-flow__edge.selected .react-flow__edge-path {
          stroke: var(--accent-blue);
          stroke-width: 3;
        }

        .react-flow__edge:hover .react-flow__edge-path {
          stroke: var(--accent-blue-light);
        }

        /* Empty canvas hint */
        .canvas-empty-hint {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-8);
          color: var(--text-muted);
          text-align: center;
          pointer-events: none;
          opacity: 0.6;
        }

        .canvas-empty-hint svg {
          width: 48px;
          height: 48px;
          opacity: 0.4;
        }

        .canvas-empty-hint p {
          font-size: 14px;
          max-width: 260px;
        }
      `}</style>

      {/* Node palette sidebar */}
      <NodePalette />

      {/* Main canvas */}
      <div className="canvas-main">
        {/* Empty state hint */}
        {nodes.length === 0 && (
          <div className="canvas-empty-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v16m8-8H4M12 8l-4 4 4 4M12 8l4 4-4 4" />
            </svg>
            <p>Drag nodes from the palette or press <kbd>T</kbd> to load a template</p>
          </div>
        )}

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
          <Background color="#334155" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                Start: '#3b82f6',
                LLM: '#10b981',
                Tool: '#f59e0b',
                Router: '#8b5cf6',
                Reducer: '#ec4899',
                LoopGuard: '#06b6d4',
                End: '#ef4444',
              };
              return colors[node.data.type] || '#94a3b8';
            }}
            maskColor="rgba(15, 23, 42, 0.6)"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
