import { create } from 'zustand';
import {
  SimulationTrace,
  createEmptyTrace,
  createSimulationStep,
  ExecutionTrace,
  SimulationError,
} from '@/models/simulation';
import { GraphModel } from '@/models/graph';
import { createSimulationEngine } from '@/services/SimulationEngine';
import { buildStateDefaults } from './stateStore';
import { validateSimulationGraph } from '@/services/simulationValidator';
import { useStateStore } from './stateStore';

interface SimulationStore {
  trace: SimulationTrace;
  executionTrace: ExecutionTrace | null;
  isPlaying: boolean;
  speed: number; // milliseconds between steps
  error: SimulationError | null;
  validationErrors: SimulationError[];

  setTrace: (trace: SimulationTrace) => void;
  reset: () => void;

  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;

  stepForward: () => void;
  stepBackward: () => void;
  jumpToStep: (stepIndex: number) => void;

  // Active elements for canvas highlighting
  activeNodeIds: string[];
  activeEdgeIds: string[];

  // Run simulation
  runSimulation: (graph: GraphModel, initialState?: Record<string, unknown>) => void;
  clearError: () => void;
  clearValidationErrors: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  trace: createEmptyTrace(),
  executionTrace: null,
  isPlaying: false,
  speed: 1000,
  error: null,
  validationErrors: [],
  activeNodeIds: [],
  activeEdgeIds: [],

  setTrace: (trace) => set({ trace }),

  reset: () => set({
    trace: createEmptyTrace(),
    executionTrace: null,
    isPlaying: false,
    error: null,
    validationErrors: [],
    activeNodeIds: [],
    activeEdgeIds: [],
  }),

  setPlaying: (playing) => set({ isPlaying: playing }),

  setSpeed: (speed) => set({ speed }),

  stepForward: () => {
    const { trace, executionTrace } = get();
    if (executionTrace && trace.currentStep < executionTrace.steps.length - 1) {
      const newStep = trace.currentStep + 1;
      const stepData = executionTrace.steps[newStep];
      if (stepData) {
        set({
          trace: { ...trace, currentStep: newStep },
          activeNodeIds: [stepData.activeNodeId],
          activeEdgeIds: stepData.firedEdgeIds,
        });
      }
    }
  },

  stepBackward: () => {
    const { trace, executionTrace } = get();
    if (trace.currentStep >= 0 && executionTrace) {
      const newStep = trace.currentStep - 1;
      const stepData = newStep >= 0 ? executionTrace.steps[newStep] : null;
      set({
        trace: { ...trace, currentStep: newStep },
        activeNodeIds: stepData ? [stepData.activeNodeId] : [],
        activeEdgeIds: stepData?.firedEdgeIds ?? [],
      });
    }
  },

  jumpToStep: (stepIndex) => {
    const { trace, executionTrace } = get();
    if (executionTrace && stepIndex >= -1 && stepIndex < executionTrace.steps.length) {
      const stepData = stepIndex >= 0 ? executionTrace.steps[stepIndex] : null;
      set({
        trace: { ...trace, currentStep: stepIndex },
        activeNodeIds: stepData ? [stepData.activeNodeId] : [],
        activeEdgeIds: stepData?.firedEdgeIds ?? [],
      });
    }
  },

  runSimulation: (graph, initialState) => {
    // Reset previous simulation
    set({
      trace: createEmptyTrace(),
      executionTrace: null,
      error: null,
      activeNodeIds: [],
      activeEdgeIds: [],
    });

    // Pre-run validation (includes schema-aware checks)
    const schema = useStateStore.getState().schema;
    const validationErrors = validateSimulationGraph(graph, schema);
    set({ validationErrors });

    try {
      // Merge schema defaults with user-provided state
      const mergedState = buildStateDefaults(initialState);
      const engine = createSimulationEngine(graph, { initialState: mergedState });
      const executionTrace = engine.run();

      // Convert ExecutionTrace to SimulationTrace for UI
      const steps = executionTrace.steps.map((step) =>
        createSimulationStep(
          step.step,
          step.firedEdgeIds,
          [step.activeNodeId],
          step.stateAfter,
          step.explanation,
          step.blockedEdgeIds
        )
      );

      const status: SimulationTrace['status'] = executionTrace.error
        ? 'error'
        : executionTrace.terminated
        ? 'complete'
        : 'running';

      const simulationTrace: SimulationTrace = {
        steps,
        status,
        currentStep: steps.length > 0 ? 0 : -1,
        error: executionTrace.error?.message,
      };

      set({
        executionTrace,
        trace: simulationTrace,
        error: executionTrace.error ?? null,
      });

      // Set initial active elements if there are steps
      if (executionTrace.steps.length > 0) {
        const firstStep = executionTrace.steps[0]!;
        set({
          activeNodeIds: [firstStep.activeNodeId],
          activeEdgeIds: firstStep.firedEdgeIds,
        });
      }
    } catch (err) {
      set({
        error: {
          type: 'no_start',
          message: err instanceof Error ? err.message : 'Unknown error',
          relatedIds: [],
        },
        trace: {
          steps: [],
          status: 'error',
          currentStep: -1,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  },

  clearError: () => set({ error: null }),
  clearValidationErrors: () => set({ validationErrors: [] }),
}));

// Note: Cross-store selectors removed due to infinite re-render issues.
// Components should subscribe to both stores separately for hover state.

// Helper to find step by node ID
export const findStepByNodeId = (nodeId: string): number | null => {
  const executionTrace = useSimulationStore.getState().executionTrace;
  if (!executionTrace) return null;

  for (let i = 0; i < executionTrace.steps.length; i++) {
    if (executionTrace.steps[i]!.activeNodeId === nodeId) {
      return i;
    }
  }
  return null;
};
