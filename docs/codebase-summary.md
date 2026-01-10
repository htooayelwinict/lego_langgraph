# Codebase Summary

## Directory Structure

```
src/
├── app/                          # App shell, layout, globals
│   ├── App.tsx                   # Main 3-column layout
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles + CSS vars
│   ├── KeyboardShortcuts.tsx     # Global key bindings
│   └── OnboardingModal.tsx       # First-time user guide
│
├── models/                       # Core data models (4 files)
│   ├── graph.ts                  # GraphModel, GraphNode, GraphEdge
│   ├── state.ts                  # StateSchema, StateField types
│   ├── simulation.ts             # ExecutionTrace, SimulationStep
│   └── template.ts               # Template system types
│
├── store/                        # Zustand state (4 stores)
│   ├── graphStore.ts             # Nodes, edges, selection
│   ├── stateStore.ts             # State schema fields
│   ├── simulationStore.ts        # Trace, playback state
│   └── uiStore.ts                # Modals, toasts
│
├── services/                     # Business logic (4 files)
│   ├── SimulationEngine.ts       # Core simulation algorithm
│   ├── conditionEvaluator.ts     # Edge condition parser
│   ├── simulationValidator.ts    # Graph validation
│   └── templateLoader.ts         # Template management
│
├── features/                     # UI feature modules (41 files)
│   ├── canvas/                  # React Flow integration (17 files)
│   │   ├── CanvasView.tsx
│   │   ├── NodePalette.tsx
│   │   ├── NodeInspector.tsx
│   │   ├── EdgeInspector.tsx
│   │   ├── nodes/               # Custom node renderers
│   │   ├── edges/               # Custom edge components
│   │   └── node-configs/        # Node property forms
│   │
│   ├── state/                   # State schema editor (5 files)
│   │   ├── StateSchemaPanel.tsx
│   │   ├── StateFieldEditor.tsx
│   │   ├── StateFieldItem.tsx
│   │   └── EnumValuesEditor.tsx
│   │
│   ├── sim/                     # Simulation controls (7 files)
│   │   ├── StepControls.tsx
│   │   ├── TraceListPanel.tsx
│   │   ├── StateSnapshotViewer.tsx
│   │   ├── TraceStepItem.tsx
│   │   ├── ErrorBanner.tsx
│   │   └── stateDiffUtils.ts
│   │
│   ├── lens/                    # Visual enhancement layer (6 files)
│   │   ├── LensOverlay.tsx
│   │   ├── LensToggle.tsx
│   │   ├── LensAnnotation.tsx
│   │   └── LensTooltips.tsx
│   │
│   ├── gallery/                 # Template gallery (3 files)
│   │   ├── TemplateGallery.tsx
│   │   └── TemplateCard.tsx
│   │
│   └── io/                      # Import/export (3 files)
│       ├── Toolbar.tsx
│       ├── exportJson.ts
│       └── importJson.ts
│
├── components/                   # Shared UI
│   └── Toast.tsx                # Notification system
│
└── assets/
    └── templates/               # Pre-built graph templates (JSON)

tests/
├── unit/                        # Vitest unit tests
└── e2e/                         # Playwright E2E tests
```

## Key Files

| File | Purpose |
|------|---------|
| [`App.tsx`](src/app/App.tsx) | Main 3-column layout (state/canvas/inspector) |
| [`CanvasView.tsx`](src/features/canvas/CanvasView.tsx) | React Flow wrapper |
| [`SimulationEngine.ts`](src/services/SimulationEngine.ts) | Core simulation algorithm |
| [`graphStore.ts`](src/store/graphStore.ts) | Graph state + localStorage persistence |
| [`graph.ts`](src/models/graph.ts) | Graph types + `validateGraph()` |

## Node Types

| Type | Config Component |
|------|-----------------|
| Start | — |
| LLM | [`LLMConfig.tsx`](src/features/canvas/node-configs/LLMConfig.tsx) |
| Tool | [`ToolConfig.tsx`](src/features/canvas/node-configs/ToolConfig.tsx) |
| Router | [`RouterConfig.tsx`](src/features/canvas/node-configs/RouterConfig.tsx) |
| Reducer | [`ReducerConfig.tsx`](src/features/canvas/node-configs/ReducerConfig.tsx) |
| LoopGuard | [`LoopGuardConfig.tsx`](src/features/canvas/node-configs/LoopGuardConfig.tsx) |
| End | — |

## Store Summary

| Store | State | Key Actions |
|-------|-------|-------------|
| [`graphStore`](src/store/graphStore.ts) | nodes, edges, selectedId, lensEnabled | addNode, updateNode, deleteNode, loadGraph |
| [`stateStore`](src/store/stateStore.ts) | fields, validationErrors | addField, updateField, getInitialState |
| [`simulationStore`](src/store/simulationStore.ts) | trace, isPlaying, speed, error | stepForward, runSimulation, reset |
| [`uiStore`](src/store/uiStore.ts) | toasts, modalVisibility | showToast, openModal, closeModal |

## Services Summary

| Service | Purpose |
|---------|---------|
| [`SimulationEngine`](src/services/SimulationEngine.ts) | Deterministic graph execution |
| [`conditionEvaluator`](src/services/conditionEvaluator.ts) | Safe condition parsing (no eval) |
| [`simulationValidator`](src/services/simulationValidator.ts) | Pre-flight graph checks |
| [`templateLoader`](src/services/templateLoader.ts) | Load template JSONs |

## File Counts

- **Total TS/TSX**: 60 files
- **Features**: 41 files
- **Models**: 4 files
- **Stores**: 4 files
- **Services**: 4 files
