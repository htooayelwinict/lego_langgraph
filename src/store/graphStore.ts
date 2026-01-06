import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Connection, Edge, Node, NodeChange, EdgeChange } from 'reactflow';
import { GraphModel, generateNodeId, generateEdgeId } from '@/models/graph';
import { showError } from '@/components/Toast';

type NodeType = 'Start' | 'LLM' | 'Tool' | 'Router' | 'Reducer' | 'LoopGuard' | 'End';

interface GraphStore {
  // State
  nodes: Node[];
  edges: Edge[];
  metadata: GraphModel['metadata'];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  lensEnabled: boolean;
  galleryOpen: boolean;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<Node['data']>) => void;
  deleteNode: (id: string) => void;

  updateEdge: (id: string, data: Partial<Edge['data']>) => void;
  deleteEdge: (id: string) => void;

  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

  loadGraph: (graph: GraphModel) => void;
  exportGraph: () => GraphModel;
  clearGraph: () => void;

  // Metadata
  updateMetadata: (metadata: GraphModel['metadata']) => void;

  // UI State
  setLensEnabled: (enabled: boolean) => void;
  toggleLens: () => void;
  setGalleryOpen: (open: boolean) => void;
  toggleGallery: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  metadata: {
    name: 'Untitled Graph',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  selectedNodeId: null,
  selectedEdgeId: null,
  lensEnabled: false,
  galleryOpen: false,

  // React Flow integration
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const edge = addEdge(
      {
        ...connection,
        id: generateEdgeId(connection.source || '', connection.target || ''),
      },
      get().edges
    );
    set({ edges: edge });
  },

  // Node operations
  addNode: (type, position) => {
    const id = generateNodeId(type);
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      data: {
        id,
        type,
        label: `${type} Node`,
        config: {},
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateNode: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  // Edge operations
  updateEdge: (id, data) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, ...data } }
          : edge
      ),
    });
  },

  deleteEdge: (id) => {
    set({
      edges: get().edges.filter((e) => e.id !== id),
      selectedEdgeId: get().selectedEdgeId === id ? null : get().selectedEdgeId,
    });
  },

  // Selection
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  // Graph operations
  loadGraph: (graph) => {
    const nodes: Node[] = graph.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        id: node.id,
        type: node.type,
        label: node.data.label,
        config: node.data.config,
      },
    }));

    const edges: Edge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      data: edge.data,
    }));

    set({
      nodes,
      edges,
      metadata: graph.metadata,
    });
  },

  exportGraph: () => {
    const { nodes, edges, metadata } = get();
    return {
      version: 'v1',
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        data: {
          label: node.data.label,
          config: node.data.config,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: edge.data,
      })),
      metadata: {
        ...metadata,
        updatedAt: new Date().toISOString(),
      },
    } as GraphModel;
  },

  clearGraph: () => {
    set({
      nodes: [],
      edges: [],
      metadata: {
        name: 'Untitled Graph',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selectedNodeId: null,
      selectedEdgeId: null,
    });
  },

  updateMetadata: (metadata) => {
    set({
      metadata: { ...get().metadata, ...metadata, updatedAt: new Date().toISOString() },
    });
  },

  // UI State actions
  setLensEnabled: (enabled) => set({ lensEnabled: enabled }),
  toggleLens: () => set((state) => ({ lensEnabled: !state.lensEnabled })),
  setGalleryOpen: (open) => set({ galleryOpen: open }),
  toggleGallery: () => set((state) => ({ galleryOpen: !state.galleryOpen })),
}));

// Local storage persistence
export function persistGraphStore() {
  const { nodes, edges, metadata } = useGraphStore.getState();
  try {
    const data = JSON.stringify({ nodes, edges, metadata });

    // Check if data fits in localStorage (~5MB typical limit)
    if (data.length > 4 * 1024 * 1024) {
      showError('Graph too large to save. Consider reducing node count.');
      return;
    }

    // Test write to check quota
    const testKey = '__langgraph-test__';
    localStorage.setItem(testKey, data);
    localStorage.removeItem(testKey);

    // Actual write
    localStorage.setItem('langgraph-graph', data);
  } catch (e) {
    console.error('Failed to persist graph:', e);
    if (e instanceof DOMException && (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      showError('Storage full. Graph could not be saved.');
    } else {
      showError('Failed to save graph. See console for details.');
    }
  }
}

export function loadPersistedGraph() {
  try {
    const saved = localStorage.getItem('langgraph-graph');
    if (saved) {
      const { nodes, edges, metadata } = JSON.parse(saved);
      useGraphStore.getState().setNodes(nodes);
      useGraphStore.getState().setEdges(edges);
      useGraphStore.getState().updateMetadata(metadata);
      return true;
    }
  } catch (e) {
    console.error('Failed to load persisted graph:', e);
    showError('Failed to load saved graph. It may be corrupted.');
  }
  return false;
}

// Auto-save on changes (only nodes, edges, metadata)
let prevState = useGraphStore.getState();
useGraphStore.subscribe((state) => {
  const { nodes, edges, metadata } = state;
  if (
    nodes !== prevState.nodes ||
    edges !== prevState.edges ||
    metadata !== prevState.metadata
  ) {
    persistGraphStore();
    prevState = state;
  }
});
