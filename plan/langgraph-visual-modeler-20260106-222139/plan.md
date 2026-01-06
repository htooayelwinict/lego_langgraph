# LangGraph Visual Modeler — Implementation Plan

**Created:** 2026-01-06
**Status:** Planning
**Based on:** `research-implementation-alignment-20250106.md`

---

## Context

### Mission Statement

Build a **deterministic, explainable visual modeling environment** for LangGraph applications where users can design, simulate, and understand workflows through an interactive canvas—no backend execution required.

### Core Principle

> *"If a user cannot explain why an edge fired, the UI has failed"*

### Success Criteria

- Users can explain graph behavior without Python code
- Users detect logic bugs before execution
- Graphs remain readable at 10+ nodes
- Simulation is deterministic and repeatable

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + TypeScript + Vite | Modern, fast, ecosystem |
| Canvas | React Flow | Node-edge modeling, battle-tested |
| State | Zustand | Simple, deterministic simulation state |
| Storage | LocalStorage/IndexedDB | Local-first, no backend |
| Validation | Client-side rule engine | TypeScript validators, JSON rules |
| Icons | Lucide React | Tree-shakeable |
| Testing | Vitest + Playwright | Fast unit + E2E coverage |

---

## Data Models

### Graph Model
```typescript
type NodeType = 'Start' | 'LLM' | 'Tool' | 'Router' | 'Reducer' | 'LoopGuard' | 'End';

type GraphNode = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  data?: {
    condition?: string;  // For Router/LoopGuard
    label?: string;
  };
};

type GraphModel = {
  version: 'v1';
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};
```

### State Schema
```typescript
type StateSchema = {
  version: 'v1';
  fields: Array<{
    key: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
    required?: boolean;
    default?: unknown;
    description?: string;
    enumValues?: string[];
  }>;
};
```

### Simulation Trace
```typescript
type SimulationStep = {
  step: number;
  firedEdgeIds: string[];
  activeNodeIds: string[];
  stateSnapshot: Record<string, unknown>;
  explanation: string;
};

type SimulationTrace = {
  steps: SimulationStep[];
  status: 'idle' | 'running' | 'complete' | 'error';
  error?: string;
};
```

---

## Phase 1: Foundation + Canvas

**Goal:** Establish project structure, React Flow canvas, and JSON I/O.

### Tasks

#### 1.1 Project Scaffold
- [ ] Initialize Vite + React + TypeScript
- [ ] Install dependencies: React Flow, Zustand, Lucide React
- [ ] Configure path aliases (`@/features`, `@/models`, etc.)
- [ ] Set up ESLint, Prettier, TypeScript strict mode

**Files:** `vite.config.ts`, `tsconfig.json`, `package.json`

#### 1.2 Core Models
- [ ] Define `GraphModel`, `GraphNode`, `GraphEdge` types
- [ ] Define `StateSchema` types
- [ ] Create graph validation utilities

**Files:** `src/models/graph.ts`, `src/models/state.ts`

#### 1.3 Zustand Store
- [ ] Create graph store (nodes, edges, CRUD operations)
- [ ] Create state schema store
- [ ] Add persistence (localStorage)

**Files:** `src/store/graphStore.ts`, `src/store/stateStore.ts`

#### 1.4 React Flow Canvas
- [ ] Wrap React Flow with custom controls
- [ ] Create node renderers for all 7 types
- [ ] Create edge renderer with condition labels
- [ ] Add mini-map and zoom controls

**Files:** `src/features/canvas/CanvasView.tsx`, `src/features/canvas/nodes/`, `src/features/canvas/edges/`

#### 1.5 Node Palette
- [ ] Drag-to-canvas from sidebar
- [ ] Double-click to add nodes
- [ ] Edge creation with source/target handles

**Files:** `src/features/canvas/NodePalette.tsx`

#### 1.6 JSON I/O
- [ ] Export graph to JSON file
- [ ] Import graph from JSON file
- [ ] Clipboard copy/paste
- [ ] Version validation

**Files:** `src/features/io/exportJson.ts`, `src/features/io/importJson.ts`

### Deliverables
- Working canvas with 7 node types
- Drag-and-drop node creation
- Edge connection between nodes
- Export/import JSON

### Verification
```bash
npm run dev
# Test: Create 2 nodes, connect with edge, export JSON, import back
```

---

## Phase 2: State Schema Panel

**Goal:** Global state schema editor with validation and node config inspector.

### Tasks

#### 2.1 State Schema Panel UI
- [ ] Side panel with field list
- [ ] Add/edit/delete field controls
- [ ] Field type selector (string, number, boolean, array, object, enum)
- [ ] Required toggle, default value input

**Files:** `src/features/state/StateSchemaPanel.tsx`

#### 2.2 State Field Editor
- [ ] Form-based field editor
- [ ] Enum values editor (for enum type)
- [ ] Description textarea
- [ ] Validation feedback

**Files:** `src/features/state/StateFieldEditor.tsx`

#### 2.3 Schema Validation
- [ ] Validate field names (no duplicates, valid identifiers)
- [ ] Validate required fields have defaults
- [ ] Validate enum types have values
- [ ] Show validation banner

**Files:** `src/services/schemaValidator.ts`

#### 2.4 Node Config Inspector
- [ ] Right panel for selected node
- [ ] Edit node label
- [ ] Node-specific config (prompt template for LLM, tool name for Tool, condition for Router)
- [ ] Delete node button

**Files:** `src/features/canvas/NodeInspector.tsx`

#### 2.5 Edge Config Editor
- [ ] Edit edge condition (for Router/LoopGuard sources)
- [ ] Edit edge label
- [ ] Delete edge button

**Files:** `src/features/canvas/EdgeInspector.tsx`

### Deliverables
- State schema panel with CRUD operations
- Node/edge inspector panels
- Schema validation with feedback

### Verification
```bash
npm run dev
# Test: Add 3 fields to state schema, edit node config, verify validation
```

---

## Phase 3: Simulation Engine

**Goal:** Deterministic step-by-step simulation with edge firing explanations.

### Tasks

#### 3.1 Simulation Engine Core
- [ ] Create `SimulationEngine` class
- [ ] Implement `step()` method
- [ ] Define edge firing rules (deterministic ordering)
- [ ] State snapshot management

**Files:** `src/services/SimulationEngine.ts`

#### 3.2 Step Controls UI
- [ ] Play/pause/step/reset buttons
- [ ] Current step indicator
- [ ] Execution speed slider

**Files:** `src/features/sim/StepControls.tsx`

#### 3.3 Trace List Panel
- [ ] Step-by-step trace list
- [ ] Click step to jump to state
- [ ] State snapshot viewer
- [ ] Edge firing explanation for each step

**Files:** `src/features/sim/TraceListPanel.tsx`

#### 3.4 Canvas Visualization
- [ ] Highlight active nodes
- [ ] Highlight fired edges
- [ ] Animate edge firing (subtle pulse)
- [ ] Show explanation tooltips on edges

**Files:** `src/features/sim/CanvasHighlights.tsx`

#### 3.5 Edge Explanations
- [ ] Generate human-readable explanations
- [ ] Show condition evaluation (true/false)
- [ ] Show state changes per step
- [ ] Store explanation in trace

**Files:** `src/services/explanationGenerator.ts`

#### 3.6 Error Handling
- [ ] Detect cycles (infinite loops)
- [ ] Detect unreachable nodes
- [ ] Show error banner with details
- [ ] Allow simulation reset

**Files:** `src/services/simulationValidator.ts`

### Deliverables
- Working simulation engine
- Step controls with play/pause/reset
- Visual feedback on canvas
- Step-by-step explanations

### Verification
```bash
npm run dev
# Test: Create ReAct graph, run simulation, verify each step has explanation
```

---

## Phase 4: Lens Overlay + Templates

**Goal:** LangGraph Lens conceptual overlay and template gallery.

### Tasks

#### 4.1 LangGraph Lens
- [ ] Lens toggle button
- [ ] Overlay showing node roles (input, processing, output)
- [ ] Highlight state flow paths
- [ ] Conceptual labels (e.g., "Decision Point" for Router)

**Files:** `src/features/lens/LensOverlay.tsx`, `src/features/lens/LensToggle.tsx`

#### 4.2 Lens Explanations
- [ ] Tooltip on lens overlay elements
- [ ] Explain LangGraph concepts in plain language
- [ ] Onboarding tooltip for first-time users

**Files:** `src/features/lens/LensTooltips.tsx`

#### 4.3 Template Gallery UI
- [ ] Gallery grid view
- [ ] Template cards with preview images
- [ ] "Use Template" button
- [ ] Filter/search

**Files:** `src/features/gallery/TemplateGallery.tsx`

#### 4.4 Canonical Templates
- [ ] ReAct Agent template
- [ ] Router template
- [ ] Sequential Chain template
- [ ] Tool Loop template
- [ ] Map-Reduce template

**Files:** `src/assets/templates/`

#### 4.5 Template System
- [ ] Template loader utility
- [ ] Template validation
- [ ] Template metadata (name, description, difficulty)
- [ ] Save current graph as template

**Files:** `src/services/templateLoader.ts`

#### 4.6 Polish & Onboarding
- [ ] Welcome modal on first visit
- [ ] Keyboard shortcuts (Ctrl+Z undo, Ctrl+Y redo, Delete)
- [ ] Toast notifications for actions
- [ ] Loading states

**Files:** `src/app/OnboardingModal.tsx`, `src/app/KeyboardShortcuts.tsx`

### Deliverables
- LangGraph Lens overlay
- 5 canonical templates
- Template gallery
- Onboarding flow

### Verification
```bash
npm run dev
# Test: Toggle lens, load ReAct template, run simulation
```

---

## Phase 5: QA + Polish

**Goal:** Performance tuning, testing, documentation, bug fixes.

### Tasks

#### 5.1 Performance
- [ ] Profile React Flow render performance
- [ ] Memoize node/edge renderers
- [ ] Virtualize side panels if needed
- [ ] Lazy load templates

**Files:** `src/features/canvas/nodes/*.tsx`, `src/features/canvas/edges/*.tsx`

#### 5.2 Testing
- [ ] Unit tests for simulation engine
- [ ] Unit tests for schema validator
- [ ] Component tests for key UI elements
- [ ] E2E tests with Playwright (critical flows)

**Files:** `tests/unit/`, `tests/e2e/`

#### 5.3 Documentation
- [ ] README with getting started
- [ ] User guide (how to create graphs)
- [ ] Contributing guide (for future)
- [ ] Schema documentation

**Files:** `README.md`, `docs/`, `SCHEMA.md`

#### 5.4 Accessibility
- [ ] Keyboard navigation for canvas
- [ ] ARIA labels for buttons
- [ ] Screen reader support for node/edge info
- [ ] Color contrast checks

**Files:** All UI components

#### 5.5 Bug Fixes
- [ ] Fix reported issues from testing
- [ ] Address edge cases (empty graphs, single node, etc.)
- [ ] Improve error messages
- [ ] Handle malformed JSON on import

#### 5.6 Release Prep
- [ ] Version bump (v1.0.0)
- [ ] Changelog
- [ ] Build optimization
- [ ] Deployment config

### Deliverables
- Tested, performant application
- Documentation for users
- v1.0.0 release

### Verification
```bash
npm run test
npm run test:e2e
npm run build
# Verify all tests pass, build succeeds
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Simulation ambiguity | Define deterministic ordering; show rules in UI |
| Complex node configs | Versioned JSON schema; validation on import |
| React Flow performance | Memoized renderers; virtualize panels |
| Lens overlay confusing | Optional toggle; onboarding tooltips |
| State schema inconsistency | Single source of truth; validate on edit |

---

## Common Pitfalls to Avoid

1. **Over-engineering simulation** — Keep it deterministic and local
2. **Opaque explanations** — Every rule must be explainable
3. **Ignoring state schema** — State modeling is the differentiator
4. **Building execution backend** — PRD says no backend execution
5. **Gamification without learning** — Focus on "aha moments," not points

---

## Unresolved Questions

1. Should we support multiple state schemas per graph or single global schema?
2. How detailed should node configs be in MVP (e.g., full prompt template vs placeholder)?
3. Should templates be editable or read-only copies when loaded?
4. How do we handle schema versioning when importing older JSON files?
