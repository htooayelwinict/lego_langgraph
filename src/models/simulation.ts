/**
 * Simulation trace models for LangGraph Visual Modeler
 */

import type { GraphNode } from './graph';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

export interface SimulationStep {
  step: number;
  firedEdgeIds: string[];
  activeNodeIds: string[];
  blockedEdgeIds: string[];
  stateSnapshot: Record<string, unknown>;
  explanation: string;
  timestamp: number;
}

export interface SimulationTrace {
  steps: SimulationStep[];
  status: SimulationStatus;
  currentStep: number;
  error?: string;
}

/**
 * Immutable graph state for simulation
 */
export interface GraphState {
  [key: string]: unknown;
}

/**
 * Schema validation result for a step
 */
export interface SchemaValidationResult {
  missingFields: string[];
  invalidTypes: Array<{ field: string; expected: string; actual: string }>;
}

/**
 * Detailed step trace with before/after state
 */
export interface DetailedStepTrace {
  step: number;
  activeNodeId: string;
  nodeType: GraphNode['type'];
  firedEdgeIds: string[];
  blockedEdgeIds: string[];
  stateBefore: GraphState;
  stateAfter: GraphState;
  explanation: string;
  schemaValidation?: SchemaValidationResult;
  // Timing data for waterfall visualization
  startedAt: number;
  endedAt: number;
  durationMs: number;
}

/**
 * Complete execution trace for replay/debugging
 */
export interface ExecutionTrace {
  steps: DetailedStepTrace[];
  finalState: GraphState;
  terminated: boolean;
  error?: SimulationError;
}

/**
 * Simulation error types
 */
export type SimulationErrorType = 'cycle' | 'unreachable' | 'no_start' | 'max_steps' | 'invalid_field_ref';

/**
 * Simulation error details
 */
export interface SimulationError {
  type: SimulationErrorType;
  message: string;
  relatedIds: string[];
}

/**
 * Create a new empty simulation trace
 */
export function createEmptyTrace(): SimulationTrace {
  return {
    steps: [],
    status: 'idle',
    currentStep: -1,
  };
}

/**
 * Create a simulation step
 */
export function createSimulationStep(
  step: number,
  firedEdgeIds: string[],
  activeNodeIds: string[],
  stateSnapshot: Record<string, unknown>,
  explanation: string,
  blockedEdgeIds: string[] = []
): SimulationStep {
  return {
    step,
    firedEdgeIds,
    activeNodeIds,
    blockedEdgeIds,
    stateSnapshot: { ...stateSnapshot },
    explanation,
    timestamp: Date.now(),
  };
}
