/**
 * Tests for simulationValidator - cycle detection, unreachable nodes, validation
 */

import { describe, it, expect } from 'vitest';
import { validateSimulationGraph, getErrorMessage, getErrorSeverity } from '@/services/simulationValidator';
import type { GraphModel } from '@/models/graph';

describe('simulationValidator', () => {
  describe('validateSimulationGraph', () => {
    describe('Start node validation', () => {
      it('returns error when no Start node', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'llm', type: 'LLM', position: { x: 0, y: 0 }, data: { label: 'LLM' } },
            { id: 'end', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
          ],
          edges: [{ id: 'e1', source: 'llm', target: 'end' }],
        };

        const errors = validateSimulationGraph(graph);

        expect(errors).toHaveLength(1);
        expect(errors[0]?.type).toBe('no_start');
        expect(errors[0]?.message).toContain('No Start node found');
      });

      it('returns error when multiple Start nodes', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start1', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start 1' } },
            { id: 'start2', type: 'Start', position: { x: 100, y: 0 }, data: { label: 'Start 2' } },
          ],
          edges: [],
        };

        const errors = validateSimulationGraph(graph);

        // Should have error about multiple Start nodes
        const startErrors = errors.filter((e) => e.type === 'no_start' && e.message.includes('Multiple'));
        expect(startErrors.length).toBeGreaterThan(0);
        expect(startErrors[0]?.relatedIds).toEqual(['start1', 'start2']);
      });

      it('passes with exactly one Start node', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'end', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
          ],
          edges: [{ id: 'e1', source: 'start', target: 'end' }],
        };

        const errors = validateSimulationGraph(graph);

        const startErrors = errors.filter((e) => e.type === 'no_start');
        expect(startErrors).toHaveLength(0);
      });
    });

    describe('End node validation', () => {
      it('returns error when no End node', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'llm', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
          ],
          edges: [{ id: 'e1', source: 'start', target: 'llm' }],
        };

        const errors = validateSimulationGraph(graph);

        expect(errors.some((e) => e.type === 'unreachable' && e.message.includes('No End node'))).toBe(true);
      });

      it('allows multiple End nodes', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'end1', type: 'End', position: { x: 100, y: -50 }, data: { label: 'End 1' } },
            { id: 'end2', type: 'End', position: { x: 100, y: 50 }, data: { label: 'End 2' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'end1' },
            { id: 'e2', source: 'start', target: 'end2' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        const endErrors = errors.filter((e) => e.message.includes('No End node'));
        expect(endErrors).toHaveLength(0);
      });
    });

    describe('unreachable node detection', () => {
      it('detects nodes unreachable from Start', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'connected', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'Connected' } },
            { id: 'unreachable', type: 'LLM', position: { x: 200, y: 100 }, data: { label: 'Isolated' } },
            { id: 'end', type: 'End', position: { x: 200, y: 0 }, data: { label: 'End' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'connected' },
            { id: 'e2', source: 'connected', target: 'end' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        const unreachableErrors = errors.filter((e) => e.type === 'unreachable' && e.message.includes('unreachable from Start'));
        expect(unreachableErrors.length).toBeGreaterThan(0);
        expect(unreachableErrors[0]?.relatedIds).toContain('unreachable');
      });

      it('does not flag Start node as unreachable from Start (BFS excludes source)', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
          ],
          edges: [],
        };

        const errors = validateSimulationGraph(graph);

        // Start node might be flagged for other issues (no outgoing edges, no end node)
        // but should NOT be in "unreachable from Start" errors
        const unreachableFromStartErrors = errors.filter(
          (e) => e.type === 'unreachable' && e.message.includes('unreachable from Start')
        );
        expect(unreachableFromStartErrors).toHaveLength(0);
      });
    });

    describe('cycle detection', () => {
      it('detects simple cycle A -> B -> A', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'a', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'A' } },
            { id: 'b', type: 'LLM', position: { x: 200, y: 0 }, data: { label: 'B' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'a' },
            { id: 'e2', source: 'a', target: 'b' },
            { id: 'e3', source: 'b', target: 'a' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        const cycleErrors = errors.filter((e) => e.type === 'cycle');
        expect(cycleErrors.length).toBeGreaterThan(0);
        expect(cycleErrors[0]?.relatedIds).toContain('a');
        expect(cycleErrors[0]?.relatedIds).toContain('b');
        expect(cycleErrors[0]?.message).toContain('Cycle detected');
      });

      it('detects self-loop A -> A', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'a', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'A' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'a' },
            { id: 'e2', source: 'a', target: 'a' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        const cycleErrors = errors.filter((e) => e.type === 'cycle');
        expect(cycleErrors.length).toBeGreaterThan(0);
      });

      it('detects multiple cycles', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'a', type: 'LLM', position: { x: 100, y: -50 }, data: { label: 'A' } },
            { id: 'b', type: 'LLM', position: { x: 200, y: -50 }, data: { label: 'B' } },
            { id: 'c', type: 'LLM', position: { x: 100, y: 50 }, data: { label: 'C' } },
            { id: 'd', type: 'LLM', position: { x: 200, y: 50 }, data: { label: 'D' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'a' },
            { id: 'e2', source: 'a', target: 'b' },
            { id: 'e3', source: 'b', target: 'a' }, // Cycle 1: A -> B -> A
            { id: 'e4', source: 'start', target: 'c' },
            { id: 'e5', source: 'c', target: 'd' },
            { id: 'e6', source: 'd', target: 'c' }, // Cycle 2: C -> D -> C
          ],
        };

        const errors = validateSimulationGraph(graph);

        const cycleErrors = errors.filter((e) => e.type === 'cycle');
        expect(cycleErrors.length).toBeGreaterThanOrEqual(2);
      });

      it('allows acyclic graph (DAG)', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'a', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'A' } },
            { id: 'b', type: 'LLM', position: { x: 200, y: 0 }, data: { label: 'B' } },
            { id: 'end', type: 'End', position: { x: 300, y: 0 }, data: { label: 'End' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'a' },
            { id: 'e2', source: 'a', target: 'b' },
            { id: 'e3', source: 'b', target: 'end' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        const cycleErrors = errors.filter((e) => e.type === 'cycle');
        expect(cycleErrors).toHaveLength(0);
      });
    });

    describe('dead end detection', () => {
      it('detects non-End nodes without outgoing edges', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'llm', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
            { id: 'end', type: 'End', position: { x: 200, y: 0 }, data: { label: 'End' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'llm' },
            // LLM has no outgoing edge, but it's not an End node
          ],
        };

        const errors = validateSimulationGraph(graph);

        const deadEndErrors = errors.filter((e) => e.message.includes('no outgoing edges'));
        expect(deadEndErrors.length).toBeGreaterThan(0);
        expect(deadEndErrors[0]?.relatedIds).toContain('llm');
      });

      it('does not flag End nodes without outgoing edges', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'end', type: 'End', position: { x: 100, y: 0 }, data: { label: 'End' } },
          ],
          edges: [{ id: 'e1', source: 'start', target: 'end' }],
        };

        const errors = validateSimulationGraph(graph);

        const deadEndErrors = errors.filter((e) => e.message.includes('no outgoing edges'));
        expect(deadEndErrors).toHaveLength(0);
      });
    });

    describe('comprehensive validation', () => {
      it('returns multiple errors for problematic graph', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'a', type: 'LLM', position: { x: 0, y: 0 }, data: { label: 'A' } },
            { id: 'b', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'B' } },
          ],
          edges: [
            { id: 'e1', source: 'a', target: 'b' },
            { id: 'e2', source: 'b', target: 'a' }, // Cycle
          ],
        };

        const errors = validateSimulationGraph(graph);

        // Should have: no start, no end, cycle
        expect(errors.length).toBeGreaterThanOrEqual(2);
      });

      it('returns empty array for valid graph', () => {
        const graph: GraphModel = {
          version: 'v1',
          nodes: [
            { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
            { id: 'llm', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'LLM' } },
            { id: 'end', type: 'End', position: { x: 200, y: 0 }, data: { label: 'End' } },
          ],
          edges: [
            { id: 'e1', source: 'start', target: 'llm' },
            { id: 'e2', source: 'llm', target: 'end' },
          ],
        };

        const errors = validateSimulationGraph(graph);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('getErrorMessage', () => {
    it('formats cycle errors', () => {
      const error = { type: 'cycle' as const, message: 'A -> B -> A', relatedIds: ['a', 'b'] };
      const message = getErrorMessage(error);

      expect(message).toContain('Cycle Detected');
      expect(message).toContain('A -> B -> A');
    });

    it('formats unreachable errors', () => {
      const error = { type: 'unreachable' as const, message: 'Node X is isolated', relatedIds: ['x'] };
      const message = getErrorMessage(error);

      expect(message).toContain('Unreachable Nodes');
      expect(message).toContain('Node X is isolated');
    });

    it('formats no_start errors', () => {
      const error = { type: 'no_start' as const, message: 'No Start node', relatedIds: [] };
      const message = getErrorMessage(error);

      expect(message).toContain('Missing Start Node');
    });

    it('formats max_steps errors', () => {
      const error = { type: 'max_steps' as const, message: 'Exceeded 1000 steps', relatedIds: ['node1'] };
      const message = getErrorMessage(error);

      expect(message).toContain('Max Steps Exceeded');
    });
  });

  describe('getErrorSeverity', () => {
    it('returns error for critical issues', () => {
      expect(getErrorSeverity({ type: 'no_start', message: '', relatedIds: [] })).toBe('error');
      expect(getErrorSeverity({ type: 'cycle', message: '', relatedIds: [] })).toBe('error');
      expect(getErrorSeverity({ type: 'max_steps', message: '', relatedIds: [] })).toBe('error');
    });

    it('returns warning for non-critical issues', () => {
      expect(getErrorSeverity({ type: 'unreachable', message: '', relatedIds: [] })).toBe('warning');
    });
  });

  describe('BFS reachability', () => {
    it('finds all nodes in simple path', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
          { id: 'a', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'A' } },
          { id: 'b', type: 'LLM', position: { x: 200, y: 0 }, data: { label: 'B' } },
          { id: 'c', type: 'LLM', position: { x: 300, y: 0 }, data: { label: 'C' } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'a' },
          { id: 'e2', source: 'a', target: 'b' },
          { id: 'e3', source: 'b', target: 'c' },
        ],
      };

      const errors = validateSimulationGraph(graph);
      const unreachableErrors = errors.filter((e) => e.type === 'unreachable' && e.message.includes('unreachable from Start'));

      expect(unreachableErrors).toHaveLength(0);
    });

    it('handles disconnected components', () => {
      const graph: GraphModel = {
        version: 'v1',
        nodes: [
          { id: 'start', type: 'Start', position: { x: 0, y: 0 }, data: { label: 'Start' } },
          { id: 'connected', type: 'LLM', position: { x: 100, y: 0 }, data: { label: 'Connected' } },
          { id: 'isolated-1', type: 'LLM', position: { x: 0, y: 100 }, data: { label: 'Isolated 1' } },
          { id: 'isolated-2', type: 'LLM', position: { x: 100, y: 100 }, data: { label: 'Isolated 2' } },
          { id: 'end', type: 'End', position: { x: 200, y: 0 }, data: { label: 'End' } },
        ],
        edges: [
          { id: 'e1', source: 'start', target: 'connected' },
          { id: 'e2', source: 'connected', target: 'end' },
          { id: 'e3', source: 'isolated-1', target: 'isolated-2' }, // Separate component
        ],
      };

      const errors = validateSimulationGraph(graph);
      const unreachableErrors = errors.filter((e) => e.type === 'unreachable' && e.message.includes('unreachable from Start'));

      expect(unreachableErrors.length).toBeGreaterThan(0);
      expect(unreachableErrors[0]?.relatedIds).toContain('isolated-1');
      expect(unreachableErrors[0]?.relatedIds).toContain('isolated-2');
    });
  });
});
