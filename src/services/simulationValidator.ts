/**
 * Simulation validator for detecting graph issues
 * Cycles, unreachable nodes, missing start/end nodes
 */

import type { GraphModel } from '@/models/graph';
import type { SimulationError } from '@/models/simulation';

/**
 * Validate graph for simulation issues
 */
export function validateSimulationGraph(graph: GraphModel): SimulationError[] {
  const errors: SimulationError[] = [];

  // Check for Start node
  const startNodes = graph.nodes.filter((n) => n.type === 'Start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'no_start',
      message: 'No Start node found. Add a Start node to begin simulation.',
      relatedIds: [],
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'no_start',
      message: 'Multiple Start nodes found. Graph should have exactly one Start node.',
      relatedIds: startNodes.map((n) => n.id),
    });
  }

  // Check for End node
  const endNodes = graph.nodes.filter((n) => n.type === 'End');
  if (endNodes.length === 0) {
    errors.push({
      type: 'unreachable',
      message: 'No End node found. Add an End node to terminate simulation.',
      relatedIds: [],
    });
  }

  // Detect unreachable nodes from Start
  if (startNodes.length > 0) {
    const startNode = startNodes[0]!;
    const reachable = bfsReachable(graph, startNode.id);
    const unreachable = graph.nodes
      .filter((n) => n.id !== startNode.id && !reachable.has(n.id))
      .map((n) => n.id);

    if (unreachable.length > 0) {
      errors.push({
        type: 'unreachable',
        message: `${unreachable.length} node(s) unreachable from Start. Connect them to the graph or remove them.`,
        relatedIds: unreachable,
      });
    }
  }

  // Detect cycles
  const cycles = detectCycles(graph);
  for (const cycle of cycles) {
    errors.push({
      type: 'cycle',
      message: `Cycle detected: ${cycle.join(' → ')}. This may cause infinite loops during simulation.`,
      relatedIds: cycle,
    });
  }

  // Check for nodes without outgoing edges (except End)
  const deadEndNodes = graph.nodes.filter(
    (n) => n.type !== 'End' && !graph.edges.some((e) => e.source === n.id)
  );
  if (deadEndNodes.length > 0) {
    errors.push({
      type: 'unreachable',
      message: `${deadEndNodes.length} node(s) have no outgoing edges. Add edges or make them End nodes.`,
      relatedIds: deadEndNodes.map((n) => n.id),
    });
  }

  return errors;
}

/**
 * BFS to find all reachable nodes from a starting node
 */
function bfsReachable(graph: GraphModel, startId: string): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    // Find all neighbors (outgoing edges)
    const neighbors = graph.edges
      .filter((e) => e.source === current)
      .map((e) => e.target);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

/**
 * Detect cycles in the graph using DFS
 */
function detectCycles(graph: GraphModel): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, graph.edges.filter((e) => e.source === node.id).map((e) => e.target));
  }

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        // Found a cycle - extract it from path
        const cycleStart = path.indexOf(neighbor);
        const cycle = [...path.slice(cycleStart), neighbor];
        cycles.push(cycle);
        return true;
      }
    }

    path.pop();
    recStack.delete(nodeId);
    return false;
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return cycles;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: SimulationError): string {
  switch (error.type) {
    case 'cycle':
      return `Cycle Detected: ${error.message}`;
    case 'unreachable':
      return `Unreachable Nodes: ${error.message}`;
    case 'no_start':
      return `Missing Start Node: ${error.message}`;
    case 'max_steps':
      return `Max Steps Exceeded: ${error.message}`;
    default:
      return error.message;
  }
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: SimulationError): 'error' | 'warning' {
  switch (error.type) {
    case 'no_start':
      return 'error';
    case 'cycle':
      return 'error';
    case 'max_steps':
      return 'error';
    case 'unreachable':
      return 'warning';
    default:
      return 'warning';
  }
}
