import { describe, it, expect, beforeEach } from 'vitest';
import { useTraceUiStore, selectIsExpanded, selectFilteredStepIds } from '@/store/traceUiStore';
import type { ExecutionTrace, DetailedStepTrace } from '@/models/simulation';

describe('traceUiStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTraceUiStore.getState().clearFilters();
    useTraceUiStore.getState().clearExpanded();
    useTraceUiStore.getState().setHoveredNodeId(null);
    useTraceUiStore.getState().setHoveredTraceId(null);
    useTraceUiStore.getState().setScrubPreviewStep(null);
  });

  describe('initial state', () => {
    it('has empty expandedStepIds', () => {
      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds).toEqual(new Set<string>());
    });

    it('has empty filterQuery', () => {
      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('');
    });

    it('has empty statusFilters', () => {
      const state = useTraceUiStore.getState();
      expect(state.statusFilters).toEqual([]);
    });

    it('has null hover state', () => {
      const state = useTraceUiStore.getState();
      expect(state.hoveredNodeId).toBeNull();
      expect(state.hoveredTraceId).toBeNull();
    });

    it('has null scrub preview step', () => {
      const state = useTraceUiStore.getState();
      expect(state.scrubPreviewStep).toBeNull();
    });
  });

  describe('toggleExpanded', () => {
    it('adds stepId to expandedStepIds when not present', () => {
      const store = useTraceUiStore.getState();
      store.toggleExpanded('step-1');

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.has('step-1')).toBe(true);
    });

    it('removes stepId from expandedStepIds when present', () => {
      const store = useTraceUiStore.getState();
      store.toggleExpanded('step-1');
      store.toggleExpanded('step-1');

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.has('step-1')).toBe(false);
    });

    it('handles multiple stepIds independently', () => {
      const store = useTraceUiStore.getState();
      store.toggleExpanded('step-1');
      store.toggleExpanded('step-2');
      store.toggleExpanded('step-1');

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.has('step-1')).toBe(false);
      expect(state.expandedStepIds.has('step-2')).toBe(true);
    });
  });

  describe('setExpanded', () => {
    it('adds stepId when expanded is true', () => {
      const store = useTraceUiStore.getState();
      store.setExpanded('step-1', true);

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.has('step-1')).toBe(true);
    });

    it('removes stepId when expanded is false', () => {
      const store = useTraceUiStore.getState();
      store.setExpanded('step-1', true);
      store.setExpanded('step-1', false);

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.has('step-1')).toBe(false);
    });

    it('does nothing when setting true on already expanded', () => {
      const store = useTraceUiStore.getState();
      store.setExpanded('step-1', true);
      store.setExpanded('step-1', true);

      const state = useTraceUiStore.getState();
      expect([...state.expandedStepIds]).toEqual(['step-1']);
    });
  });

  describe('clearExpanded', () => {
    it('clears all expanded stepIds', () => {
      const store = useTraceUiStore.getState();
      store.toggleExpanded('step-1');
      store.toggleExpanded('step-2');
      store.toggleExpanded('step-3');
      store.clearExpanded();

      const state = useTraceUiStore.getState();
      expect(state.expandedStepIds.size).toBe(0);
    });
  });

  describe('setFilterQuery', () => {
    it('updates filterQuery', () => {
      const store = useTraceUiStore.getState();
      store.setFilterQuery('test query');

      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('test query');
    });

    it('handles empty string', () => {
      const store = useTraceUiStore.getState();
      store.setFilterQuery('test');
      store.setFilterQuery('');

      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('');
    });

    it('handles special characters', () => {
      const store = useTraceUiStore.getState();
      store.setFilterQuery('search with <special> & "chars"');

      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('search with <special> & "chars"');
    });
  });

  describe('toggleStatusFilter', () => {
    it('adds status when not present', () => {
      const store = useTraceUiStore.getState();
      store.toggleStatusFilter('fired');

      const state = useTraceUiStore.getState();
      expect(state.statusFilters).toContain('fired');
    });

    it('removes status when present', () => {
      const store = useTraceUiStore.getState();
      store.toggleStatusFilter('fired');
      store.toggleStatusFilter('fired');

      const state = useTraceUiStore.getState();
      expect(state.statusFilters).not.toContain('fired');
    });

    it('handles multiple status filters', () => {
      const store = useTraceUiStore.getState();
      store.toggleStatusFilter('fired');
      store.toggleStatusFilter('blocked');
      store.toggleStatusFilter('error');

      const state = useTraceUiStore.getState();
      expect(state.statusFilters).toEqual(['fired', 'blocked', 'error']);
    });

    it('removes correct status when multiple present', () => {
      const store = useTraceUiStore.getState();
      store.toggleStatusFilter('fired');
      store.toggleStatusFilter('blocked');
      store.toggleStatusFilter('fired');

      const state = useTraceUiStore.getState();
      expect(state.statusFilters).toEqual(['blocked']);
    });
  });

  describe('clearFilters', () => {
    it('resets filterQuery to empty', () => {
      const store = useTraceUiStore.getState();
      store.setFilterQuery('test query');
      store.clearFilters();

      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('');
    });

    it('resets statusFilters to empty', () => {
      const store = useTraceUiStore.getState();
      store.toggleStatusFilter('fired');
      store.toggleStatusFilter('blocked');
      store.clearFilters();

      const state = useTraceUiStore.getState();
      expect(state.statusFilters).toEqual([]);
    });

    it('clears all filters together', () => {
      const store = useTraceUiStore.getState();
      store.setFilterQuery('test');
      store.toggleStatusFilter('fired');
      store.clearFilters();

      const state = useTraceUiStore.getState();
      expect(state.filterQuery).toBe('');
      expect(state.statusFilters).toEqual([]);
    });
  });

  describe('setHoveredNodeId', () => {
    it('updates hoveredNodeId', () => {
      const store = useTraceUiStore.getState();
      store.setHoveredNodeId('node-1');

      const state = useTraceUiStore.getState();
      expect(state.hoveredNodeId).toBe('node-1');
    });

    it('can set to null', () => {
      const store = useTraceUiStore.getState();
      store.setHoveredNodeId('node-1');
      store.setHoveredNodeId(null);

      const state = useTraceUiStore.getState();
      expect(state.hoveredNodeId).toBeNull();
    });
  });

  describe('setHoveredTraceId', () => {
    it('updates hoveredTraceId', () => {
      const store = useTraceUiStore.getState();
      store.setHoveredTraceId('trace-1');

      const state = useTraceUiStore.getState();
      expect(state.hoveredTraceId).toBe('trace-1');
    });

    it('can set to null', () => {
      const store = useTraceUiStore.getState();
      store.setHoveredTraceId('trace-1');
      store.setHoveredTraceId(null);

      const state = useTraceUiStore.getState();
      expect(state.hoveredTraceId).toBeNull();
    });
  });

  describe('setScrubPreviewStep', () => {
    it('updates scrubPreviewStep', () => {
      const store = useTraceUiStore.getState();
      store.setScrubPreviewStep(5);

      const state = useTraceUiStore.getState();
      expect(state.scrubPreviewStep).toBe(5);
    });

    it('can set to null', () => {
      const store = useTraceUiStore.getState();
      store.setScrubPreviewStep(5);
      store.setScrubPreviewStep(null);

      const state = useTraceUiStore.getState();
      expect(state.scrubPreviewStep).toBeNull();
    });

    it('can set to negative value', () => {
      const store = useTraceUiStore.getState();
      store.setScrubPreviewStep(-1);

      const state = useTraceUiStore.getState();
      expect(state.scrubPreviewStep).toBe(-1);
    });

    it('can set to zero', () => {
      const store = useTraceUiStore.getState();
      store.setScrubPreviewStep(0);

      const state = useTraceUiStore.getState();
      expect(state.scrubPreviewStep).toBe(0);
    });
  });

  describe('selectIsExpanded selector', () => {
    it('returns true when stepId is expanded', () => {
      const store = useTraceUiStore.getState();
      store.toggleExpanded('step-1');

      const isExpanded = selectIsExpanded('step-1')(useTraceUiStore.getState());
      expect(isExpanded).toBe(true);
    });

    it('returns false when stepId is not expanded', () => {
      const isExpanded = selectIsExpanded('step-1')(useTraceUiStore.getState());
      expect(isExpanded).toBe(false);
    });
  });

  describe('selectFilteredStepIds', () => {
    const mockExecutionTrace: ExecutionTrace = {
      steps: [
        {
          step: 0,
          activeNodeId: 'start',
          nodeType: 'Start',
          firedEdgeIds: ['e1'],
          blockedEdgeIds: [],
          stateBefore: {},
          stateAfter: {},
          explanation: 'Start node executed',
          startedAt: 0,
          endedAt: 100,
          durationMs: 100,
        },
        {
          step: 1,
          activeNodeId: 'llm',
          nodeType: 'LLM',
          firedEdgeIds: ['e2'],
          blockedEdgeIds: ['e3'],
          stateBefore: {},
          stateAfter: { llmOutput: 'result' },
          explanation: 'LLM processing completed',
          startedAt: 100,
          endedAt: 500,
          durationMs: 400,
        },
        {
          step: 2,
          activeNodeId: 'end',
          nodeType: 'End',
          firedEdgeIds: [],
          blockedEdgeIds: [],
          stateBefore: { llmOutput: 'result' },
          stateAfter: { llmOutput: 'result' },
          explanation: 'End node reached',
          startedAt: 500,
          endedAt: 600,
          durationMs: 100,
        },
      ],
      finalState: { llmOutput: 'result' },
      terminated: true,
    };

    it('returns all step indices when no filters', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, '', []);
      expect(filtered).toEqual([0, 1, 2]);
    });

    it('returns empty array when trace is null', () => {
      const filtered = selectFilteredStepIds(null, '', []);
      expect(filtered).toEqual([]);
    });

    it('filters by explanation query', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'LLM', []);
      expect(filtered).toEqual([1]);
    });

    it('filters by nodeType query', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'Start', []);
      expect(filtered).toEqual([0]);
    });

    it('filters by activeNodeId query', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'llm', []);
      expect(filtered).toEqual([1]);
    });

    it('is case insensitive for query', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'START', []);
      expect(filtered).toEqual([0]);
    });

    it('filters by fired status', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, '', ['fired']);
      expect(filtered).toEqual([0, 1]);
    });

    it('filters by blocked status', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, '', ['blocked']);
      expect(filtered).toEqual([1]);
    });

    it('filters by multiple status filters (OR logic)', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, '', ['blocked', 'fired']);
      expect(filtered).toEqual([0, 1]);
    });

    it('combines query and status filters (AND logic)', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'LLM', ['fired']);
      expect(filtered).toEqual([1]);
    });

    it('trims whitespace from query', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, '  LLM  ', []);
      expect(filtered).toEqual([1]);
    });

    it('returns empty when no matches', () => {
      const filtered = selectFilteredStepIds(mockExecutionTrace, 'nonexistent', []);
      expect(filtered).toEqual([]);
    });
  });
});
