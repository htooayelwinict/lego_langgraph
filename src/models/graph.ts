/**
 * Core graph data models for LangGraph Visual Modeler
 */

export type NodeType = 'Start' | 'LLM' | 'Tool' | 'Router' | 'Reducer' | 'LoopGuard' | 'End';

export interface GraphNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    condition?: string;
    label?: string;
  };
}

export interface GraphMetadata {
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GraphModel {
  version: 'v1';
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: GraphMetadata;
}

/**
 * Create a new empty graph model
 */
export function createEmptyGraph(name?: string): GraphModel {
  return {
    version: 'v1',
    nodes: [],
    edges: [],
    metadata: {
      name: name || 'Untitled Graph',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate a unique node ID
 */
export function generateNodeId(type: NodeType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `node-${type.toLowerCase()}-${timestamp}-${random}`;
}

/**
 * Generate a unique edge ID
 */
export function generateEdgeId(source: string, target: string): string {
  const timestamp = Date.now();
  return `edge-${source}-${target}-${timestamp}`;
}

/**
 * Validate graph structure
 */
export interface GraphValidationError {
  type: 'no_start' | 'no_end' | 'duplicate_id' | 'orphaned_edge';
  message: string;
  relatedIds: string[];
}

export function validateGraph(graph: GraphModel): GraphValidationError[] {
  const errors: GraphValidationError[] = [];
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const startNodes = graph.nodes.filter((n) => n.type === 'Start');
  const endNodes = graph.nodes.filter((n) => n.type === 'End');

  // Check for duplicate node IDs
  const idCounts = new Map<string, number>();
  for (const node of graph.nodes) {
    idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);
  }
  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      errors.push({
        type: 'duplicate_id',
        message: `Duplicate node ID: ${id}`,
        relatedIds: [id],
      });
    }
  }

  // Check for Start node
  if (startNodes.length === 0) {
    errors.push({
      type: 'no_start',
      message: 'Graph must have at least one Start node',
      relatedIds: [],
    });
  }

  // Check for End node
  if (endNodes.length === 0) {
    errors.push({
      type: 'no_end',
      message: 'Graph must have at least one End node',
      relatedIds: [],
    });
  }

  // Check for orphaned edges
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        type: 'orphaned_edge',
        message: `Edge source node not found: ${edge.source}`,
        relatedIds: [edge.id, edge.source],
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        type: 'orphaned_edge',
        message: `Edge target node not found: ${edge.target}`,
        relatedIds: [edge.id, edge.target],
      });
    }
  }

  return errors;
}
