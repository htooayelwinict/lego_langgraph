/**
 * Tests for simulation trace models
 */

import { describe, it, expect } from 'vitest';
import {
  createEmptyTrace,
  createSimulationStep,
  type SimulationTrace,
  type SimulationStep,
  type GraphState,
  type DetailedStepTrace,
  type ExecutionTrace,
  type SimulationError,
} from '@/models/simulation';

describe('simulation models', () => {
  describe('createEmptyTrace', () => {
    it('creates empty trace with idle status', () => {
      const trace = createEmptyTrace();

      expect(trace.status).toBe('idle');
      expect(trace.steps).toEqual([]);
      expect(trace.currentStep).toBe(-1);
      expect(trace.error).toBeUndefined();
    });

    it('has correct SimulationTrace type shape', () => {
      const trace: SimulationTrace = createEmptyTrace();

      expect(trace).toHaveProperty('steps');
      expect(trace).toHaveProperty('status');
      expect(trace).toHaveProperty('currentStep');
    });
  });

  describe('createSimulationStep', () => {
    it('creates step with all required fields', () => {
      const stateSnapshot: GraphState = { foo: 'bar', count: 42 };
      const step = createSimulationStep(
        0,
        ['edge-1'],
        ['node-1'],
        stateSnapshot,
        'Test explanation'
      );

      expect(step.step).toBe(0);
      expect(step.firedEdgeIds).toEqual(['edge-1']);
      expect(step.activeNodeIds).toEqual(['node-1']);
      expect(step.stateSnapshot).toEqual({ foo: 'bar', count: 42 });
      expect(step.explanation).toBe('Test explanation');
      expect(step.timestamp).toBeGreaterThan(0);
    });

    it('creates step with blocked edges', () => {
      const step = createSimulationStep(
        1,
        ['edge-1'],
        ['node-2'],
        {},
        'Explanation',
        ['edge-2', 'edge-3']
      );

      expect(step.blockedEdgeIds).toEqual(['edge-2', 'edge-3']);
    });

    it('defaults blockedEdgeIds to empty array', () => {
      const step = createSimulationStep(0, [], [], {}, 'test');

      expect(step.blockedEdgeIds).toEqual([]);
    });

    it('clones state snapshot (shallow clone - nested objects share references)', () => {
      // Note: The implementation uses { ...state } which is a shallow clone
      // Nested objects and arrays still share references
      const originalState: GraphState = { mutable: [1, 2, 3] };
      const step = createSimulationStep(0, [], [], originalState, 'test');

      // Modify original after creating step
      originalState.mutable.push(4);

      // Shallow clone means nested arrays are still shared
      // This is a known limitation - would need deep clone for full immutability
      expect(step.stateSnapshot.mutable).toEqual([1, 2, 3, 4]);
    });
  });

  describe('type validation', () => {
    it('SimulationStep type includes all fields', () => {
      const step: SimulationStep = {
        step: 0,
        firedEdgeIds: ['e1'],
        activeNodeIds: ['n1'],
        blockedEdgeIds: [],
        stateSnapshot: {},
        explanation: 'test',
        timestamp: Date.now(),
      };

      expect(step.step).toBe(0);
    });

    it('DetailedStepTrace includes stateBefore and stateAfter', () => {
      const trace: DetailedStepTrace = {
        step: 0,
        activeNodeId: 'node-1',
        nodeType: 'LLM',
        firedEdgeIds: ['e1'],
        blockedEdgeIds: [],
        stateBefore: { input: 'test' },
        stateAfter: { output: 'result' },
        explanation: 'Executed',
      };

      expect(trace.stateBefore).toEqual({ input: 'test' });
      expect(trace.stateAfter).toEqual({ output: 'result' });
    });

    it('ExecutionTrace includes finalState and terminated flag', () => {
      const trace: ExecutionTrace = {
        steps: [],
        finalState: { result: 'done' },
        terminated: true,
      };

      expect(trace.finalState).toEqual({ result: 'done' });
      expect(trace.terminated).toBe(true);
    });

    it('SimulationError includes type and relatedIds', () => {
      const error: SimulationError = {
        type: 'cycle',
        message: 'Cycle detected',
        relatedIds: ['node-1', 'node-2'],
      };

      expect(error.type).toBe('cycle');
      expect(error.relatedIds).toEqual(['node-1', 'node-2']);
    });
  });

  describe('immutability', () => {
    it('stateSnapshot uses shallow clone (top-level properties are independent)', () => {
      // Top-level properties are cloned independently
      const original: GraphState = { topLevel: 1 };
      const step = createSimulationStep(0, [], [], original, 'test');

      original.topLevel = 999;

      // Top-level property changes don't affect the snapshot
      expect(step.stateSnapshot.topLevel).toBe(1);
    });

    it('nested objects share references (known limitation)', () => {
      // Nested objects still share references due to shallow clone
      const original: GraphState = { nested: { value: 1 } };
      const step = createSimulationStep(0, [], [], original, 'test');

      original.nested.value = 999;

      // Nested object mutation affects snapshot (shared reference)
      expect(step.stateSnapshot.nested.value).toBe(999);
    });
  });
});
