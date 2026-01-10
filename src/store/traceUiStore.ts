import { create } from 'zustand';

interface TraceUiState {
  // Expansion state - which step cards are expanded
  expandedStepIds: Set<string>;

  // Filter state
  filterQuery: string;
  statusFilters: string[]; // 'fired' | 'blocked' | 'pending' | 'error'

  // Hover state for connected highlights
  hoveredNodeId: string | null;
  hoveredTraceId: string | null;

  // Timeline scrubber preview state
  scrubPreviewStep: number | null;

  // Actions
  toggleExpanded: (stepId: string) => void;
  setExpanded: (stepId: string, expanded: boolean) => void;
  clearExpanded: () => void;

  setFilterQuery: (query: string) => void;
  toggleStatusFilter: (status: string) => void;
  clearFilters: () => void;

  setHoveredNodeId: (nodeId: string | null) => void;
  setHoveredTraceId: (traceId: string | null) => void;

  setScrubPreviewStep: (step: number | null) => void;
}

export const useTraceUiStore = create<TraceUiState>((set) => ({
  // Initial state
  expandedStepIds: new Set<string>(),
  filterQuery: '',
  statusFilters: [],
  hoveredNodeId: null,
  hoveredTraceId: null,
  scrubPreviewStep: null,

  // Expansion actions
  toggleExpanded: (stepId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedStepIds);
      if (newExpanded.has(stepId)) {
        newExpanded.delete(stepId);
      } else {
        newExpanded.add(stepId);
      }
      return { expandedStepIds: newExpanded };
    }),

  setExpanded: (stepId, expanded) =>
    set((state) => {
      const newExpanded = new Set(state.expandedStepIds);
      if (expanded) {
        newExpanded.add(stepId);
      } else {
        newExpanded.delete(stepId);
      }
      return { expandedStepIds: newExpanded };
    }),

  clearExpanded: () => set({ expandedStepIds: new Set() }),

  // Filter actions
  setFilterQuery: (query) => set({ filterQuery: query }),

  toggleStatusFilter: (status) =>
    set((state) => {
      const newFilters = state.statusFilters.includes(status)
        ? state.statusFilters.filter((s) => s !== status)
        : [...state.statusFilters, status];
      return { statusFilters: newFilters };
    }),

  clearFilters: () => set({ filterQuery: '', statusFilters: [] }),

  // Hover actions
  setHoveredNodeId: (nodeId) => set({ hoveredNodeId: nodeId }),

  setHoveredTraceId: (traceId) => set({ hoveredTraceId: traceId }),

  // Scrubber preview
  setScrubPreviewStep: (step) => set({ scrubPreviewStep: step }),
}));

// Derived selectors
export const selectIsExpanded = (stepId: string) => (state: TraceUiState) =>
  state.expandedStepIds.has(stepId);

export const selectFilteredStepIds = (
  executionTrace: import('@/models/simulation').ExecutionTrace | null,
  filterQuery: string,
  statusFilters: string[]
) => {
  if (!executionTrace) return [];

  const query = filterQuery.toLowerCase().trim();

  return executionTrace.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => {
      // Filter by query
      if (query) {
        const matchesQuery =
          step.explanation.toLowerCase().includes(query) ||
          step.nodeType.toLowerCase().includes(query) ||
          step.activeNodeId.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Filter by status
      if (statusFilters.length > 0) {
        const hasFired = step.firedEdgeIds.length > 0;
        const hasBlocked = step.blockedEdgeIds.length > 0;
        const hasError = step.schemaValidation?.missingFields.length === 0 ? false : true;

        const matchesStatus = statusFilters.some((status) => {
          switch (status) {
            case 'fired':
              return hasFired;
            case 'blocked':
              return hasBlocked;
            case 'error':
              return hasError;
            default:
              return false;
          }
        });

        if (!matchesStatus) return false;
      }

      return true;
    })
    .map(({ index }) => index);
};
