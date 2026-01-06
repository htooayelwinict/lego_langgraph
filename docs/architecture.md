# Architecture

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Canvas | React Flow |
| State | Zustand |
| Virtualization | @tanstack/react-virtual |
| Storage | localStorage |
| Validation | Client-side rule engine |
| Testing | Vitest (unit) + Playwright (E2E) |

## Data Flow

```
User Input → Canvas/State Panel → Zustand Store → Services → Models
                                      ↓
                              localStorage (auto-save)
```

## State Stores

### `graphStore`
- Canvas nodes/edges
- Graph metadata
- Selection state
- UI state (lens, gallery)

### `stateStore`
- State schema fields
- Validation errors
- Field CRUD operations

### `simulationStore`
- Execution trace
- Current step index
- Active nodes/edges for visualization

### `uiStore`
- Modal state
- Panel visibility
- Toast notifications

## Core Models

### `GraphModel`
- `nodes` — Array of graph nodes with position, type, config
- `edges` — Array of edges with conditions
- `metadata` — Name, description, timestamps
- `version` — Schema version for migration

### `StateSchema`
- `fields` — Array of field definitions (key, type, required, default)
- `validation` — Custom validation rules

### `ExecutionTrace`
- `steps` — Array of simulation steps
- `finalState` — Resulting state after execution

## Services

### `SimulationEngine`
Deterministic execution engine:
- Step-by-step execution
- Edge ordering (sorted by ID)
- Cycle detection
- Router: first matching edge wins
- LoopGuard: blocks if no conditions match

### `conditionEvaluator`
Parses and evaluates edge conditions:
- State field access (`state.messages`)
- Comparison operators (`>`, `<`, `==`, `!=`)
- Logical operators (`&&`, `||`, `!`)

### `simulationValidator`
Validates graph before simulation:
- At least one Start node
- At least one End node
- No orphaned edges
- No duplicate node IDs

## Feature Modules

### Canvas (`features/canvas/`)
- `CanvasView.tsx` — React Flow wrapper
- `NodePalette.tsx` — Draggable node types
- `nodes/CustomNode.tsx` — Node renderer (memoized)
- `edges/ConditionEdge.tsx` — Edge renderer (memoized)
- `NodeInspector.tsx` — Selected node config panel
- `EdgeInspector.tsx` — Selected edge condition panel

### State (`features/state/`)
- `StateSchemaPanel.tsx` — Virtualized field list
- `StateFieldEditor.tsx` — Add/edit field dialog
- `EnumValuesEditor.tsx` — Enum value editor

### Simulation (`features/sim/`)
- `StepControls.tsx` — Play/pause/step/reset
- `TraceListPanel.tsx` — Execution history list
- `StateSnapshotViewer.tsx` — Diff viewer for state changes

### Lens (`features/lens/`)
- `LensOverlay.tsx` — Conceptual annotations overlay
- `LensTooltips.tsx` — Educational tooltips
- `LensToggle.tsx` — Enable/disable lens

### Gallery (`features/gallery/`)
- `TemplateGallery.tsx` — Template browser
- `TemplateCard.tsx` — Template preview card

### IO (`features/io/`)
- `Toolbar.tsx` — Export/import/clear actions
- `exportJson.ts` — Graph → JSON export
- `importJson.ts` — JSON → Graph import with validation

## Performance Optimizations

1. **Memoization** — All node/edge renderers use `React.memo`
2. **Virtualization** — State panel uses `@tanstack/react-virtual`
3. **React Flow** — `nodeDragThreshold`, `selectNodesOnDrag=false`, `onlyRenderVisibleElements`
4. **Zustand** — Selector-based subscriptions to prevent unnecessary re-renders

## Determinism Rules

1. Edge execution order: sorted by edge ID (ascending)
2. Router: fires **first** matching edge only
3. LoopGuard: blocks all if no conditions match
4. Cycle detection: tracks visited nodes in current path
