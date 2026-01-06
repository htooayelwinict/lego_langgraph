# Phase 1: Foundation + Canvas

**Status:** ✅ Completed
**Completed:** 2026-01-06

## Objective

Establish project infrastructure, React Flow canvas with all node types, and JSON import/export functionality.

## Prerequisites

- Node.js 18+ installed
- Git initialized

## Tasks

### 1.1 Project Scaffold

Initialize Vite + React + TypeScript project with dependencies.

**Implementation:**
```bash
npm create vite@latest . -- --template react-ts
npm install reactflow zustand lucide-react
npm install -D @types/node
```

**Files:**
- `vite.config.ts` — Add path aliases `@/`
- `tsconfig.json` — Enable strict mode
- `package.json` — Dependencies above
- `.eslintrc.cjs` — TypeScript rules
- `.prettierrc` — Formatting config

### 1.2 Core Models

Define TypeScript types for graphs and state.

**Implementation:**
```typescript
// src/models/graph.ts
export type NodeType = 'Start' | 'LLM' | 'Tool' | 'Router' | 'Reducer' | 'LoopGuard' | 'End';

export interface GraphNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    condition?: string;
    label?: string;
  };
}

export interface GraphModel {
  version: 'v1';
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}
```

**Files:**
- `src/models/graph.ts` — Graph types
- `src/models/state.ts` — State schema types

### 1.3 Zustand Store

Create state management for graphs and schema.

**Implementation:**
```typescript
// src/store/graphStore.ts
import { create } from 'zustand';
import { GraphNode, GraphEdge, GraphModel } from '@/models/graph';

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  addNode: (node: GraphNode) => void;
  updateNode: (id: string, data: Partial<GraphNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: GraphEdge) => void;
  deleteEdge: (id: string) => void;
  loadGraph: (graph: GraphModel) => void;
  exportGraph: () => GraphModel;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  // ... implementations
}));
```

**Files:**
- `src/store/graphStore.ts` — Graph CRUD operations
- `src/store/stateStore.ts` — State schema CRUD
- Add localStorage persistence middleware

### 1.4 React Flow Canvas

Wrap React Flow with custom node and edge renderers.

**Implementation:**
- Create `CanvasView.tsx` wrapping `ReactFlow`
- Create 7 node components in `nodes/` folder
- Create custom edge component in `edges/` folder
- Add MiniMap and Controls

**Files:**
- `src/features/canvas/CanvasView.tsx`
- `src/features/canvas/nodes/StartNode.tsx`
- `src/features/canvas/nodes/LLMNode.tsx`
- `src/features/canvas/nodes/ToolNode.tsx`
- `src/features/canvas/nodes/RouterNode.tsx`
- `src/features/canvas/nodes/ReducerNode.tsx`
- `src/features/canvas/nodes/LoopGuardNode.tsx`
- `src/features/canvas/nodes/EndNode.tsx`
- `src/features/canvas/edges/ConditionEdge.tsx`

**Node Design:**
- Icon + label + config summary
- Source handle (top) + target handle (bottom)
- Unique color per node type

### 1.5 Node Palette

Drag-and-drop palette for adding nodes.

**Implementation:**
- Sidebar with draggable node types
- `onDrop` handler on canvas to create nodes
- Double-click handler for quick add

**Files:**
- `src/features/canvas/NodePalette.tsx`

### 1.6 JSON I/O

Import/export functionality for graph portability.

**Implementation:**
```typescript
// src/features/io/exportJson.ts
export function exportGraph(graph: GraphModel): void {
  const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${graph.metadata?.name || 'graph'}.json`;
  a.click();
}

// src/features/io/importJson.ts
export async function importGraph(file: File): Promise<GraphModel> {
  const text = await file.text();
  const graph = JSON.parse(text);
  // Validate version and structure
  return graph;
}
```

**Files:**
- `src/features/io/exportJson.ts`
- `src/features/io/importJson.ts`
- Add toolbar buttons for export/import

## Deliverables

- [x] Working React Flow canvas
- [x] 7 node types with unique visuals
- [x] Edge creation between nodes
- [x] Drag-to-add from palette
- [x] Export/import JSON files

## Verification

```bash
npm run dev

# Manual test:
# 1. Drag Start node to canvas
# 2. Drag LLM node to canvas
# 3. Connect Start → LLM
# 4. Export JSON
# 5. Clear canvas, import JSON
# 6. Verify graph restored
```

## Notes

- Use `React.memo` for node renderers to prevent unnecessary re-renders
- Node ID format: `node-${timestamp}-${random}`
- Edge ID format: `edge-${source}-${target}`
- Store positions in `node.position` for React Flow

## Rollback Strategy

If React Flow integration issues arise:
- Fall back to basic SVG canvas
- Revisit React Flow version compatibility
- Check for conflicting CSS/global styles
