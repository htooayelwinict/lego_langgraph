# Phase 3: Simulation Engine

**Status:** ✅ Completed
**Completed:** 2026-01-06

## Objective

Build deterministic step-by-step simulation with visual feedback and explanations.

## Prerequisites

- [x] Phase 1 and 2 completed
- [x] Graph and state models stable
- Node/edge configs working

## Tasks

### 3.1 Simulation Engine Core

Create deterministic simulation engine.

**Implementation:**
```typescript
// src/services/SimulationEngine.ts
export class SimulationEngine {
  private graph: GraphModel;
  private state: Record<string, unknown>;
  private currentNodeId: string | null = null;
  private stepCount = 0;

  constructor(graph: GraphModel, initialState: Record<string, unknown>) {
    this.graph = graph;
    this.state = { ...initialState };
  }

  step(): SimulationStep {
    // 1. Find active node(s)
    // 2. Evaluate outgoing edges
    // 3. Determine which edges fire
    // 4. Update state
    // 5. Return step with explanation
  }

  private evaluateCondition(condition: string, state: Record<string, unknown>): boolean {
    // Simple expression evaluation for MVP
    // Support: field == value, field != value, field > value, etc.
  }

  private fireEdge(edge: GraphEdge): void {
    // Apply state changes based on target node type
  }
}
```

**Deterministic Rules:**
- Edge order by ID (ascending)
- Multiple edges fire if all conditions true
- Router nodes only fire first matching edge
- LoopGuard blocks if condition false

**Files:**
- `src/services/SimulationEngine.ts`
- `src/services/conditionEvaluator.ts`

### 3.2 Step Controls UI

Playback controls for simulation.

**Implementation:**
- Play button (auto-step with delay)
- Pause button
- Step button (single step)
- Reset button
- Speed slider (delay between auto-steps)
- Step counter display

**Files:**
- `src/features/sim/StepControls.tsx`

### 3.3 Trace List Panel

Panel showing step-by-step execution history.

**Implementation:**
```typescript
// src/features/sim/TraceListPanel.tsx
export function TraceListPanel() {
  const { trace, currentStep } = useSimulationStore();

  return (
    <div className="trace-panel">
      {trace.map((step, idx) => (
        <TraceStepItem
          key={idx}
          step={step}
          active={idx === currentStep}
          onClick={() => jumpToStep(idx)}
        />
      ))}
    </div>
  );
}
```

**Features:**
- List of all steps
- Click to jump to step
- Show fired edges
- Show active nodes
- State snapshot viewer (expandable)

**Files:**
- `src/features/sim/TraceListPanel.tsx`
- `src/features/sim/TraceStepItem.tsx`
- `src/features/sim/StateSnapshotViewer.tsx`

### 3.4 Canvas Visualization

Visual feedback on canvas during simulation.

**Implementation:**
- Highlight active nodes (border + glow)
- Highlight fired edges (animated dash pattern)
- Dim inactive elements
- Show explanation tooltip on hovered edge
- Animation duration: 300ms

**Files:**
- `src/features/sim/CanvasHighlights.tsx`
- Update `ConditionEdge.tsx` to support highlight state

### 3.5 Edge Explanations

Generate human-readable explanations for edge firings.

**Implementation:**
```typescript
// src/services/explanationGenerator.ts
export function explainEdgeFiring(
  edge: GraphEdge,
  state: Record<string, unknown>
): string {
  if (edge.data?.condition) {
    const result = evaluateCondition(edge.data.condition, state);
    return `Condition "${edge.data.condition}" evaluated to ${result}`;
  }
  return `Edge fired from ${edge.source} to ${edge.target}`;
}
```

**Features:**
- Show condition evaluation result
- Show relevant state values
- Explain why edge fired or didn't fire
- Store in simulation trace

**Files:**
- `src/services/explanationGenerator.ts`

### 3.6 Error Handling

Detect and report simulation errors.

**Implementation:**
```typescript
// src/services/simulationValidator.ts
export interface SimulationError {
  type: 'cycle' | 'unreachable' | 'invalid_state';
  message: string;
  relatedIds: string[];
}

export function validateGraph(graph: GraphModel): SimulationError[] {
  const errors: SimulationError[] = [];

  // Detect cycles
  const visited = new Set<string>();
  const recStack = new Set<string>();
  // ... cycle detection

  // Detect unreachable nodes (from Start)
  const startNode = graph.nodes.find(n => n.type === 'Start');
  if (startNode) {
    const reachable = bfsReachable(graph, startNode.id);
    const unreachable = graph.nodes
      .filter(n => n.id !== startNode.id && !reachable.has(n.id))
      .map(n => n.id);

    if (unreachable.length > 0) {
      errors.push({
        type: 'unreachable',
        message: `${unreachable.length} nodes unreachable from Start`,
        relatedIds: unreachable,
      });
    }
  }

  return errors;
}
```

**Features:**
- Cycle detection (infinite loops)
- Unreachable node detection
- Invalid state after transformation
- Show error banner with "Fix" button

**Files:**
- `src/services/simulationValidator.ts`
- `src/features/sim/ErrorBanner.tsx`

## Deliverables

- [ ] Working simulation engine
- [ ] Step controls (play/pause/step/reset)
- [ ] Visual canvas highlights
- [ ] Trace list with state viewer
- [ ] Edge firing explanations
- [ ] Error detection and reporting

## Verification

```bash
npm run dev

# Manual test:
# 1. Create Start → Router → (LLM A, LLM B) → End
# 2. Set Router condition: state.input == "route_a"
# 3. Click Play
# 4. Verify: Start active, Router edge to LLM A fires
# 5. Check trace: Step 1 shows correct explanation
# 6. Verify visual highlights on canvas
# 7. Try creating cycle → should show error
```

## Notes

- Simulation is fully deterministic (no randomness)
- State mutations are immutable (create new objects)
- Store complete trace for replay/debugging
- Edge firing order is stable (sorted by ID)

## Rollback Strategy

If simulation engine issues:
- Start with mock/placeholder behavior
- Hard-code 2-3 example scenarios
- Skip condition evaluation for MVP (always fire first edge)
- Focus on visual feedback over correctness initially
