# Requirements Analysis

**Source:** `research-implementation-alignment-20250106.md`

## Core Value Proposition

> **"The Duolingo of LangGraph"** — Interactive learning through deterministic simulation

Users must understand **WHY** each edge fired. Explainability is the primary constraint.

## Functional Requirements

### P0 — Must Have (Foundation)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| R1 | Visual Canvas | 7 node types; drag-and-drop; edge creation with labels |
| R2 | State Model Panel | Schema editor; field types (string, number, boolean, array, object, enum) |
| R3 | Simulation | Step-by-step execution; active node highlight; edge explanations |
| R4 | LangGraph Lens | Toggle overlay showing conceptual model |
| R5 | Templates | 3-5 canonical examples (ReAct, Router, Tool Loop) |

### P1 — Should Have (Delight)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| R6 | State Flow | Animated edges showing data movement |
| R7 | Quick-Add | Manual palette; double-click to add nodes |
| R8 | Pattern Recognition | Rule-based linting with explanations |

### P2 — Nice to Have (Growth)

- AI-assisted suggestions (deferred)
- Remix/sharing (deferred)
- Advanced analytics (deferred)

## Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| N1 | Performance | Smooth canvas interaction with 10+ nodes |
| N2 | Determinism | Simulation results are repeatable |
| N3 | Offline | No backend dependency for MVP |
| N4 | Portability | Import/export JSON format |
| N5 | Explainability | Every action is understandable |

## Constraints

| ID | Constraint | Impact |
|----|------------|--------|
| C1 | No LLM calls | Simulation must use mock/deterministic behavior |
| C2 | Frontend-only MVP | Python integration deferred |
| C3 | Single source of truth | State schema drives simulation validation |

## Node Types

| Type | Purpose | Config |
|------|---------|--------|
| Start | Entry point | None |
| LLM | Language model call | Prompt template |
| Tool | Function/tool call | Tool name, params |
| Router | Conditional branching | Condition expression |
| Reducer | State merge operation | Merge strategy |
| Loop Guard | Loop condition | Boolean expression |
| End | Terminal state | None |

## Data Models

### Graph Model
```typescript
type GraphModel = {
  version: 'v1';
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: { name?: string; description?: string };
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
```

## User Stories

1. **As a LangGraph learner**, I want to see step-by-step execution so I can understand how state flows through the graph.
2. **As a developer**, I want to validate my graph structure before running real code.
3. **As a user**, I want to see edge firing explanations so I can debug conditional logic.
4. **As a beginner**, I want template examples so I can learn common patterns.
