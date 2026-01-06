# References & Best Practices

**Date:** 2026-01-06

## Documentation Sources

### LangGraph
- **Official Docs:** https://langchain-ai.github.io/langgraph/
- **Concepts:** State, Nodes, Edges, Conditional Branching
- **Patterns to Model:** ReAct Agent, Router, Sequential Chain, Map-Reduce

### React Flow
- **Docs:** https://reactflow.dev/
- **Key Concepts:** Custom Node Types, Edge Types, Controls, Minimap
- **Performance:** Memoization, virtualization for large graphs

### React + TypeScript Patterns
- **Feature-First:** Co-locate components, hooks, types by feature
- **Compound Components:** For canvas controls, simulation panels
- **Render Props:** For customizable node/edge renderers

## Architectural Patterns

### 1. Feature-First Structure
```
src/features/canvas/
├── CanvasView.tsx
├── nodes/
│   ├── StartNode.tsx
│   ├── LLMNode.tsx
│   └── ...
├── edges/
│   └── ConditionEdge.tsx
└── hooks/
    └── useCanvasInteraction.ts
```

### 2. Deterministic State Management (Zustand)
```typescript
interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stateSchema: StateSchema;
  updateNode: (id: string, data: Partial<GraphNode>) => void;
  addEdge: (edge: GraphEdge) => void;
}
```

### 3. Simulation Engine Pattern
```typescript
class SimulationEngine {
  private graph: GraphModel;
  private state: Record<string, unknown>;

  step(): SimulationStep {
    // 1. Identify active nodes
    // 2. Evaluate conditions
    // 3. Fire edges
    // 4. Update state
    // 5. Return step with explanation
  }
}
```

## Best Practices

### Performance
- **Memoize node/edge renderers** — `React.memo` with shallow prop comparison
- **Virtualize side panels** — Only render visible fields/steps
- **Debounce validation** — Don't validate on every keystroke

### UX
- **Edge labels always visible** — Critical for understanding conditions
- **Active state clear** — Highlight + border for active nodes
- **Explanations contextual** — Show near the element being explained

### TypeScript
- **Discriminated unions for node types**
- **Branded types for IDs** — `type NodeId = string & { readonly __brand: "NodeId" }`
- **Strict null checks** — No `!` assertions

## External Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| Canvas | React Flow | Battle-tested; customizable |
| State | Zustand | Simple; no boilerplate |
| Icons | Lucide React | Tree-shakeable |
| Theme | CSS Variables | Easy dark mode |
| Testing | Vitest + Playwright | Fast + E2E coverage |

## Canonical Templates to Include

1. **ReAct Agent** — Reason + Act loop with tools
2. **Router** — LLM-based routing to different paths
3. **Sequential Chain** — Linear state transformation
4. **Tool Loop** — Repeated tool calls until condition met
5. **Map-Reduce** — Parallel execution with aggregation

## Anti-Patterns to Avoid

1. **Opaque AI suggestions** — Every rule must be explainable
2. **Real LLM calls in simulation** — Defeats deterministic purpose
3. **Complex node configs** — Keep templates simple for learning
4. **Over-engineering** — Start with 3-5 templates, expand later
