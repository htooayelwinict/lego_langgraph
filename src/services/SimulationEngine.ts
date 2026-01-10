/**
 * Deterministic simulation engine for LangGraph visual modeler
 * Executes node-edge graphs step-by-step with immutable state
 */

import type { GraphModel, GraphNode, GraphEdge } from '@/models/graph';
import type {
  GraphState,
  ExecutionTrace,
  DetailedStepTrace,
  SimulationError,
} from '@/models/simulation';
import { explainEdgeFiring } from './conditionEvaluator';

/**
 * Simulation options
 * @property initialState - Should already include schema defaults (use buildStateDefaults)
 */
export interface SimulationOptions {
  maxSteps?: number; // Safety limit to prevent infinite loops
  initialState?: GraphState;
}

/**
 * Simulation engine class
 */
export class SimulationEngine {
  private graph: GraphModel;
  private edgeMap: Map<string, GraphEdge[]>; // nodeId -> outgoing edges
  private nodeMap: Map<string, GraphNode>;
  private options: Required<SimulationOptions>;

  constructor(graph: GraphModel, options: SimulationOptions = {}) {
    this.graph = graph;
    this.options = {
      maxSteps: options.maxSteps ?? 1000,
      initialState: options.initialState ?? {},
    };
    this.nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
    this.edgeMap = this.buildEdgeMap(graph.edges);
  }

  /**
   * Build adjacency list with stable sort by edge ID
   */
  private buildEdgeMap(edges: GraphEdge[]): Map<string, GraphEdge[]> {
    const map = new Map<string, GraphEdge[]>();

    for (const edge of edges) {
      const list = map.get(edge.source) ?? [];
      list.push(edge);
      map.set(edge.source, list);
    }

    // Sort edges by ID for deterministic execution
    for (const [nodeId, list] of map) {
      list.sort((a, b) => a.id.localeCompare(b.id));
      map.set(nodeId, list);
    }

    return map;
  }

  /**
   * Run the full simulation
   */
  public run(): ExecutionTrace {
    const steps: DetailedStepTrace[] = [];
    let stepCount = 0;

    // Find Start node
    const startNode = this.graph.nodes.find((n) => n.type === 'Start');
    if (!startNode) {
      return {
        steps: [],
        finalState: this.options.initialState,
        terminated: false,
        error: {
          type: 'no_start',
          message: 'No Start node found in graph',
          relatedIds: [],
        },
      };
    }

    // Initialize state
    let currentState: GraphState = { ...this.options.initialState };
    let currentNodeId: string | null = startNode.id;
    let terminated = false;
    let error: SimulationError | undefined;

    // Track visited nodes for cycle detection
    const visitedInPath = new Set<string>();

    while (!terminated && stepCount < this.options.maxSteps) {
      // Cycle detection
      if (visitedInPath.has(currentNodeId!)) {
        error = {
          type: 'cycle',
          message: `Cycle detected at node ${currentNodeId}`,
          relatedIds: Array.from(visitedInPath),
        };
        break;
      }

      const node = this.nodeMap.get(currentNodeId!);
      if (!node) {
        terminated = true;
        break;
      }

      visitedInPath.add(currentNodeId);

      const startedAt = performance.now();
      const stateBefore = { ...currentState };
      const stateAfter = this.executeNode(node, stateBefore);
      const endedAt = performance.now();

      const outgoing = this.edgeMap.get(node.id) ?? [];
      const { nextNodeId, firedEdgeIds, blockedEdgeIds, explanation } =
        this.selectNextNode(node, outgoing, stateAfter);

      steps.push({
        step: stepCount,
        activeNodeId: node.id,
        nodeType: node.type,
        firedEdgeIds,
        blockedEdgeIds,
        stateBefore,
        stateAfter,
        explanation,
        startedAt,
        endedAt,
        durationMs: Math.round(endedAt - startedAt),
      });

      currentState = stateAfter;
      stepCount += 1;

      // Check if we've reached an End node
      if (node.type === 'End') {
        terminated = true;
        break;
      }

      // Check if we have nowhere to go
      if (!nextNodeId) {
        // For non-End nodes with no outgoing edges, this is termination
        if (outgoing.length === 0) {
          terminated = true;
        } else if (node.type === 'Router' || node.type === 'LoopGuard') {
          // Router/LoopGuard with no matching edges is a dead end
          terminated = true;
        }
        break;
      }

      currentNodeId = nextNodeId;

      // Clear visited path when we move to a different node
      // (allows revisiting nodes through different paths)
      if (node.type !== 'Router' && node.type !== 'LoopGuard') {
        visitedInPath.clear();
      }
    }

    // Check for max steps exceeded
    if (stepCount >= this.options.maxSteps) {
      error = {
        type: 'max_steps',
        message: `Maximum step limit (${this.options.maxSteps}) exceeded`,
        relatedIds: [currentNodeId!],
      };
    }

    return {
      steps,
      finalState: currentState,
      terminated,
      error,
    };
  }

  /**
   * Execute a single node (mock behavior for MVP)
   */
  private executeNode(node: GraphNode, state: GraphState): GraphState {
    const config = node.data.config ?? {};

    switch (node.type) {
      case 'LLM':
        // Mock LLM execution
        return {
          ...state,
          llmOutput: `[Mock LLM response for ${node.id}]`,
          _lastLLMNode: node.id,
        };

      case 'Tool':
        // Mock tool execution
        return {
          ...state,
          toolOutput: `[Mock tool result for ${config.toolName || node.id}]`,
          _lastToolNode: node.id,
        };

      case 'Reducer':
        // Mock reducer - aggregates values
        const reduceKey = (config.reduceKey as string) ?? 'reduced';
        return {
          ...state,
          [reduceKey]: true,
          _lastReducerNode: node.id,
        };

      case 'Router':
      case 'LoopGuard':
      case 'Start':
      case 'End':
      default:
        // These nodes don't modify state directly
        return { ...state };
    }
  }

  /**
   * Select next node based on current node type and outgoing edges
   */
  private selectNextNode(
    node: GraphNode,
    outgoing: GraphEdge[],
    state: GraphState
  ): {
    nextNodeId: string | null;
    firedEdgeIds: string[];
    blockedEdgeIds: string[];
    explanation: string;
  } {
    const fired: string[] = [];
    const blocked: string[] = [];
    let explanations: string[] = [];

    // End node - no outgoing edges
    if (node.type === 'End') {
      return {
        nextNodeId: null,
        firedEdgeIds: [],
        blockedEdgeIds: [],
        explanation: 'End node reached - simulation complete',
      };
    }

    // No outgoing edges
    if (outgoing.length === 0) {
      return {
        nextNodeId: null,
        firedEdgeIds: [],
        blockedEdgeIds: [],
        explanation: `Node ${node.data.label || node.id} has no outgoing edges`,
      };
    }

    // Router: fires first matching edge only
    if (node.type === 'Router') {
      for (const edge of outgoing) {
        const { fired: edgeFired, explanation } = explainEdgeFiring(edge, state);
        explanations.push(explanation);

        if (edgeFired) {
          fired.push(edge.id);
          return {
            nextNodeId: edge.target,
            firedEdgeIds: fired,
            blockedEdgeIds: outgoing.filter((e) => e.id !== edge.id).map((e) => e.id),
            explanation: `Router selected path to ${edge.target}: ${explanation}`,
          };
        } else {
          blocked.push(edge.id);
        }
      }

      return {
        nextNodeId: null,
        firedEdgeIds: fired,
        blockedEdgeIds: blocked,
        explanation: `Router: No conditions matched - ${explanations.join('; ')}`,
      };
    }

    // LoopGuard: blocks all edges if condition false
    if (node.type === 'LoopGuard') {
      for (const edge of outgoing) {
        const { fired: edgeFired, explanation } = explainEdgeFiring(edge, state);
        explanations.push(explanation);

        if (edgeFired) {
          fired.push(edge.id);
        } else {
          blocked.push(edge.id);
        }
      }

      // LoopGuard fires first matching edge or blocks all
      if (fired.length > 0) {
        const firstFired = outgoing.find((e) => e.id === fired[0])!;
        return {
          nextNodeId: firstFired.target,
          firedEdgeIds: fired,
          blockedEdgeIds: blocked,
          explanation: `LoopGuard allows execution: ${explanations[0]}`,
        };
      }

      return {
        nextNodeId: null,
        firedEdgeIds: fired,
        blockedEdgeIds: blocked,
        explanation: `LoopGuard blocked: ${explanations.join('; ')}`,
      };
    }

    // Default behavior: fire first matching edge
    for (const edge of outgoing) {
      const { fired: edgeFired, explanation } = explainEdgeFiring(edge, state);
      explanations.push(explanation);

      if (edgeFired) {
        fired.push(edge.id);
        return {
          nextNodeId: edge.target,
          firedEdgeIds: fired,
          blockedEdgeIds: outgoing.filter((e) => e.id !== edge.id).map((e) => e.id),
          explanation: explanation,
        };
      } else {
        blocked.push(edge.id);
      }
    }

    // No edges fired
    return {
      nextNodeId: null,
      firedEdgeIds: fired,
      blockedEdgeIds: blocked,
      explanation: explanations.join('; ') || 'No edges fired',
    };
  }
}

/**
 * Create a simulation engine instance
 */
export function createSimulationEngine(
  graph: GraphModel,
  options?: SimulationOptions
): SimulationEngine {
  return new SimulationEngine(graph, options);
}
