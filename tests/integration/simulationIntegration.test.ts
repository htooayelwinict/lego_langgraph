/**
 * Integration Tests: Simulation Flow
 *
 * Tests the complete simulation workflow across multiple stores:
 * - graphStore: Manages nodes and edges
 * - simulationStore: Manages simulation state and execution
 * - stateStore: Provides initial state with schema defaults
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGraphStore } from '@/store/graphStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useStateStore } from '@/store/stateStore';
import type { GraphModel } from '@/models/graph';

describe('Simulation Integration Flow', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useGraphStore.getState().clearGraph();
    useSimulationStore.getState().reset();
    useStateStore.getState().clearFields();
  });

  describe('basic simulation workflow', () => {
    it('runs simulation on a simple linear graph', () => {
      // Arrange: Create a simple Start -> LLM -> End graph
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('LLM', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({
        source: nodes[0].id,
        target: nodes[1].id,
      });
      useGraphStore.getState().onConnect({
        source: nodes[1].id,
        target: nodes[2].id,
      });

      const graph = useGraphStore.getState().exportGraph();

      // Act: Run the simulation
      useSimulationStore.getState().runSimulation(graph);

      // Assert: Verify simulation completed successfully
      const simState = useSimulationStore.getState();
      expect(simState.trace.status).toBe('complete');
      expect(simState.trace.steps).toHaveLength(3);
      expect(simState.executionTrace?.steps).toHaveLength(3);

      // Verify nodes were visited in correct order
      const stepNodeTypes = simState.executionTrace!.steps.map((s) => s.nodeType);
      expect(stepNodeTypes).toEqual(['Start', 'LLM', 'End']);
    });

    it('tracks active nodes and edges during simulation', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('Tool', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      const graph = useGraphStore.getState().exportGraph();

      // Act
      useSimulationStore.getState().runSimulation(graph);

      // Assert: First step should highlight Start node
      const simState = useSimulationStore.getState();
      expect(simState.activeNodeIds).toEqual([nodes[0].id]);
      expect(simState.activeEdgeIds).toHaveLength(1);
    });

    it('merges schema defaults into initial state', () => {
      // Arrange: Set up state schema with defaults
      useStateStore.getState().addField({
        id: 'field-1',
        name: 'input',
        type: 'string',
        defaultValue: 'default value',
      });
      useStateStore.getState().addField({
        id: 'field-2',
        name: 'count',
        type: 'number',
        defaultValue: 42,
      });

      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });

      const graph = useGraphStore.getState().exportGraph();

      // Act: Run with custom initial state plus schema defaults
      useSimulationStore.getState().runSimulation(graph, {
        custom: 'user value',
      });

      // Assert: Initial state should include both schema defaults and custom values
      const simState = useSimulationStore.getState();
      const firstStep = simState.executionTrace?.steps[0];
      expect(firstStep?.stateBefore).toEqual({
        input: 'default value',
        count: 42,
        custom: 'user value',
      });
    });
  });

  describe('step navigation workflow', () => {
    it('navigates forward through simulation steps', () => {
      // Arrange: Create and run a simulation
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('LLM', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Act: Step forward twice
      useSimulationStore.getState().stepForward();
      useSimulationStore.getState().stepForward();

      // Assert
      const simState = useSimulationStore.getState();
      expect(simState.trace.currentStep).toBe(1);
      expect(simState.activeNodeIds).toEqual([nodes[1].id]);
    });

    it('navigates backward through simulation steps', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('LLM', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Act: Step to end, then back
      useSimulationStore.getState().stepForward();
      useSimulationStore.getState().stepForward();
      useSimulationStore.getState().stepForward();
      useSimulationStore.getState().stepBackward();

      // Assert
      const simState = useSimulationStore.getState();
      expect(simState.trace.currentStep).toBe(1);
      expect(simState.activeNodeIds).toEqual([nodes[1].id]);
    });

    it('jumps to specific step', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('LLM', { x: 100, y: 0 });
      useGraphStore.getState().addNode('Tool', { x: 200, y: 0 });
      useGraphStore.getState().addNode('End', { x: 300, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });
      useGraphStore.getState().onConnect({ source: nodes[2].id, target: nodes[3].id });

      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Act: Jump to step 2
      useSimulationStore.getState().jumpToStep(2);

      // Assert
      const simState = useSimulationStore.getState();
      expect(simState.trace.currentStep).toBe(2);
      expect(simState.activeNodeIds).toEqual([nodes[2].id]);
    });

    it('handles boundary conditions in navigation', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );

      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Act & Assert: Can't step backward from start
      useSimulationStore.getState().stepBackward();
      expect(useSimulationStore.getState().trace.currentStep).toBe(-1);

      // Can't step forward past end
      useSimulationStore.getState().jumpToStep(1);
      useSimulationStore.getState().stepForward();
      expect(useSimulationStore.getState().trace.currentStep).toBe(1);
    });
  });

  describe('router node integration', () => {
    it('correctly routes based on state conditions', () => {
      // Arrange: Create router with two paths
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('Router', { x: 100, y: 0 });
      useGraphStore.getState().addNode('Tool', { x: 200, y: -50 });
      useGraphStore.getState().addNode('End', { x: 300, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      const edges = useGraphStore.getState();

      edges.onConnect({ source: nodes[0].id, target: nodes[1].id });
      edges.onConnect({ source: nodes[1].id, target: nodes[2].id });
      edges.onConnect({ source: nodes[2].id, target: nodes[3].id });

      // Set condition on router edge
      const edgeId = edges.edges[1].id;
      edges.updateEdge(edgeId, { condition: 'state.route === "A"' });

      const graph = useGraphStore.getState().exportGraph();

      // Act: Run with matching state
      useSimulationStore.getState().runSimulation(graph, { route: 'A' });

      // Assert: Should take the Tool path
      const simState = useSimulationStore.getState();
      const visitedNodeTypes = simState.executionTrace!.steps.map((s) => s.nodeType);
      expect(visitedNodeTypes).toContain('Tool');
    });

    it('shows validation warnings for graph issues', () => {
      // Arrange: Create graph with no Start node
      useGraphStore.getState().addNode('LLM', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );

      // Act: Try to run simulation
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert: Should have error
      const simState = useSimulationStore.getState();
      expect(simState.error).toBeDefined();
      expect(simState.error?.type).toBe('no_start');
    });
  });

  describe('state modifications across simulation', () => {
    it('LLM nodes add output to state', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('LLM', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      // Act
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert: LLM step should have modified state
      const simState = useSimulationStore.getState();
      const llmStep = simState.executionTrace?.steps.find((s) => s.nodeType === 'LLM');
      expect(llmStep?.stateAfter).toHaveProperty('llmOutput');
      expect(llmStep?.stateAfter).toHaveProperty('_lastLLMNode', nodes[1].id);
    });

    it('Tool nodes add output to state', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('Tool', { x: 100, y: 0 });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      // Act
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert
      const simState = useSimulationStore.getState();
      const toolStep = simState.executionTrace?.steps.find((s) => s.nodeType === 'Tool');
      expect(toolStep?.stateAfter).toHaveProperty('toolOutput');
      expect(toolStep?.stateAfter).toHaveProperty('_lastToolNode', nodes[1].id);
    });

    it('Reducer nodes update state', () => {
      // Arrange
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('Reducer', { x: 100, y: 0 });
      useGraphStore.getState().updateNode(useGraphStore.getState().nodes[1].id, {
        config: { reduceKey: 'aggregated' },
      });
      useGraphStore.getState().addNode('End', { x: 200, y: 0 });

      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id });
      useGraphStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id });

      // Act
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert
      const simState = useSimulationStore.getState();
      const reducerStep = simState.executionTrace?.steps.find((s) => s.nodeType === 'Reducer');
      expect(reducerStep?.stateAfter).toHaveProperty('aggregated', true);
      expect(reducerStep?.stateAfter).toHaveProperty('_lastReducerNode', nodes[1].id);
    });
  });

  describe('simulation reset behavior', () => {
    it('clears previous simulation when running new one', () => {
      // Arrange: Run first simulation
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());
      expect(useSimulationStore.getState().trace.steps).toHaveLength(2);

      // Add another node and re-run
      useGraphStore.getState().addNode('LLM', { x: 50, y: 0 });
      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[2].id });
      useGraphStore.getState().onConnect({ source: nodes[2].id, target: nodes[1].id });

      // Act
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert: Old simulation should be cleared
      const simState = useSimulationStore.getState();
      expect(simState.trace.steps).toHaveLength(3);
      expect(simState.error).toBeNull();
      expect(simState.validationErrors).toHaveLength(0);
    });

    it('resets to initial state when reset is called', () => {
      // Arrange: Run a simulation
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());
      useSimulationStore.getState().stepForward();

      // Act
      useSimulationStore.getState().reset();

      // Assert
      const simState = useSimulationStore.getState();
      expect(simState.trace.currentStep).toBe(-1);
      expect(simState.trace.steps).toHaveLength(0);
      expect(simState.executionTrace).toBeNull();
      expect(simState.activeNodeIds).toHaveLength(0);
      expect(simState.activeEdgeIds).toHaveLength(0);
      expect(simState.error).toBeNull();
      expect(simState.isPlaying).toBe(false);
    });
  });

  describe('graph modifications during simulation', () => {
    it('detects changes when graph is modified', () => {
      // Arrange: Create and run simulation
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Act: Modify the graph
      useGraphStore.getState().addNode('LLM', { x: 50, y: 0 });

      // Assert: The old simulation trace should still exist (doesn't auto-update)
      // Users must manually re-run to see changes
      expect(useSimulationStore.getState().trace.steps).toHaveLength(2);
    });

    it('can run new simulation after graph modification', () => {
      // Arrange: Initial simulation
      useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
      useGraphStore.getState().addNode('End', { x: 100, y: 0 });
      useGraphStore.getState().onConnect(
        { source: useGraphStore.getState().nodes[0].id, target: useGraphStore.getState().nodes[1].id }
      );
      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());
      expect(useSimulationStore.getState().trace.steps).toHaveLength(2);

      // Act: Add LLM node and re-run
      useGraphStore.getState().addNode('LLM', { x: 50, y: 0 });
      const nodes = useGraphStore.getState().nodes;
      useGraphStore.getState().onConnect({ source: nodes[0].id, target: nodes[2].id });
      useGraphStore.getState().onConnect({ source: nodes[2].id, target: nodes[1].id });

      useSimulationStore.getState().runSimulation(useGraphStore.getState().exportGraph());

      // Assert: New simulation has 3 steps
      expect(useSimulationStore.getState().trace.steps).toHaveLength(3);
    });
  });
});
