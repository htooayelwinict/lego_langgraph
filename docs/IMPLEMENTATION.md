# LangGraph Visual Builder - Implementation Plan

## 🏗️ Technical Implementation Guide

This document provides the detailed technical roadmap for building the MVP.

---

## 📁 Project Structure

```
langgraph-studio/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Canvas/
│   │   │   │   │   ├── Canvas.tsx
│   │   │   │   │   ├── MiniMap.tsx
│   │   │   │   │   └── Controls.tsx
│   │   │   │   ├── Nodes/
│   │   │   │   │   ├── BaseNode.tsx
│   │   │   │   │   ├── StartNode.tsx
│   │   │   │   │   ├── EndNode.tsx
│   │   │   │   │   ├── LLMNode.tsx
│   │   │   │   │   ├── ToolNode.tsx
│   │   │   │   │   ├── RouterNode.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Edges/
│   │   │   │   │   ├── CustomEdge.tsx
│   │   │   │   │   └── ConditionalEdge.tsx
│   │   │   │   ├── Panels/
│   │   │   │   │   ├── NodePalette.tsx
│   │   │   │   │   ├── PropertiesPanel.tsx
│   │   │   │   │   ├── CodePreview.tsx
│   │   │   │   │   └── ExecutionPanel.tsx
│   │   │   │   ├── Layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── BottomPanel.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       └── Select.tsx
│   │   │   ├── stores/
│   │   │   │   ├── graphStore.ts      # Zustand store for graph state
│   │   │   │   ├── uiStore.ts         # UI state (panels, selection)
│   │   │   │   └── executionStore.ts  # Execution state
│   │   │   ├── services/
│   │   │   │   ├── codeGenerator.ts   # LangGraph code generation
│   │   │   │   ├── persistence.ts     # Save/load workflows
│   │   │   │   └── api.ts             # Backend communication
│   │   │   ├── hooks/
│   │   │   │   ├── useGraph.ts
│   │   │   │   ├── useExecution.ts
│   │   │   │   └── useKeyboard.ts
│   │   │   ├── types/
│   │   │   │   ├── nodes.ts
│   │   │   │   ├── edges.ts
│   │   │   │   └── graph.ts
│   │   │   ├── templates/
│   │   │   │   ├── simpleChain.ts
│   │   │   │   ├── reactAgent.ts
│   │   │   │   └── router.ts
│   │   │   ├── utils/
│   │   │   │   ├── validation.ts
│   │   │   │   └── layout.ts
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── tailwind.config.js
│   │
│   └── api/                    # Python backend (Phase 3)
│       ├── app/
│       │   ├── main.py
│       │   ├── routes/
│       │   │   ├── execute.py
│       │   │   └── generate.py
│       │   ├── services/
│       │   │   ├── executor.py
│       │   │   └── code_generator.py
│       │   └── models/
│       │       └── schemas.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   └── shared/                 # Shared types/utils
│       ├── types/
│       └── constants/
│
├── docs/
│   ├── PRD.md
│   └── IMPLEMENTATION.md
│
├── package.json               # Monorepo root
├── pnpm-workspace.yaml
└── README.md
```

---

## 🔧 Tech Stack Details

### Frontend

| Technology | Purpose | Why? |
|------------|---------|------|
| **React 18** | UI Framework | Industry standard, huge ecosystem |
| **TypeScript** | Type Safety | Essential for complex state |
| **React Flow** | Graph Visualization | Best-in-class for node editors |
| **Zustand** | State Management | Simple, performant, minimal boilerplate |
| **TailwindCSS** | Styling | Rapid UI development |
| **Monaco Editor** | Code Display | VS Code's editor, syntax highlighting |
| **Vite** | Build Tool | Fast dev server, optimized builds |
| **Framer Motion** | Animations | Polished micro-interactions |

### Backend (Phase 3)

| Technology | Purpose | Why? |
|------------|---------|------|
| **FastAPI** | API Framework | Modern Python, async, auto-docs |
| **WebSockets** | Real-time | Live execution updates |
| **LangGraph** | Execution | The actual runtime |
| **Pydantic** | Validation | Type-safe data models |

---

## 🗓️ Sprint Breakdown

### Sprint 1: Project Setup & Basic Canvas (Week 1)

**Goals:** Get a working canvas with basic node placement

**Tasks:**

```markdown
Day 1-2: Project Initialization
- [ ] Initialize monorepo with pnpm
- [ ] Setup React + Vite + TypeScript
- [ ] Configure TailwindCSS
- [ ] Setup ESLint + Prettier
- [ ] Create basic folder structure
- [ ] Initialize Git repository

Day 3-4: React Flow Integration
- [ ] Install and configure React Flow
- [ ] Create basic Canvas component
- [ ] Implement pan and zoom
- [ ] Add minimap component
- [ ] Add controls (zoom in/out, fit view)
- [ ] Setup grid background

Day 5: Basic Nodes
- [ ] Create BaseNode component
- [ ] Implement StartNode
- [ ] Implement EndNode
- [ ] Style nodes with Tailwind
- [ ] Add connection handles (ports)
```

**Deliverable:** Canvas where you can add START/END nodes and connect them

---

### Sprint 2: Node System & Palette (Week 2)

**Goals:** Complete node types with drag-from-palette

**Tasks:**

```markdown
Day 1-2: Node Palette
- [ ] Create NodePalette sidebar component
- [ ] Implement drag-and-drop from palette
- [ ] Add node type icons
- [ ] Style palette with categories

Day 3-4: Additional Node Types
- [ ] Implement LLMNode with ports
- [ ] Implement ToolNode
- [ ] Implement RouterNode (multiple outputs)
- [ ] Color-code node types
- [ ] Add node icons

Day 5: Edge Improvements
- [ ] Create custom bezier edge
- [ ] Add edge labels
- [ ] Implement edge deletion
- [ ] Add animated edges (optional)
```

**Deliverable:** Full node palette with all MVP node types

---

### Sprint 3: Properties Panel & Configuration (Week 3)

**Goals:** Configure node properties via side panel

**Tasks:**

```markdown
Day 1-2: Properties Panel
- [ ] Create PropertiesPanel component
- [ ] Implement dynamic form based on node type
- [ ] Connect to Zustand store
- [ ] Add form validation

Day 3: LLM Configuration
- [ ] Model selector (GPT-4, Claude, etc.)
- [ ] Temperature slider
- [ ] Max tokens input
- [ ] System prompt textarea
- [ ] Prompt template with variables

Day 4: Tool Configuration
- [ ] Tool type selector
- [ ] Tool parameters form
- [ ] Built-in tools (search, calculator)
- [ ] Custom tool definition

Day 5: Router Configuration
- [ ] Condition builder UI
- [ ] Multiple output edges
- [ ] Default route option
```

**Deliverable:** Fully configurable nodes

---

### Sprint 4: Code Generation (Week 4)

**Goals:** Generate valid LangGraph Python code

**Tasks:**

```markdown
Day 1-2: Code Generator Service
- [ ] Create codeGenerator service
- [ ] Generate state class from schema
- [ ] Generate node functions
- [ ] Generate edge connections
- [ ] Handle conditional edges

Day 3: Code Preview Panel
- [ ] Integrate Monaco editor
- [ ] Setup Python syntax highlighting
- [ ] Live code updates on graph change
- [ ] Copy to clipboard button
- [ ] Download as .py file

Day 4-5: Code Quality
- [ ] Generate proper imports
- [ ] Handle variable naming
- [ ] Add code comments
- [ ] Generate requirements.txt
- [ ] Test generated code actually runs
```

**Deliverable:** Copy-paste-ready LangGraph code

---

### Sprint 5: Persistence & Templates (Week 5)

**Goals:** Save/load workflows, template system

**Tasks:**

```markdown
Day 1-2: Local Persistence
- [ ] Create persistence service
- [ ] Save to localStorage
- [ ] Auto-save on changes
- [ ] Load on app start
- [ ] Clear storage option

Day 3: Export/Import
- [ ] Export workflow as JSON
- [ ] Import workflow from JSON
- [ ] Validate imported data
- [ ] Handle version migrations

Day 4-5: Template System
- [ ] Create template data structures
- [ ] Simple Chain template
- [ ] ReAct Agent template
- [ ] Router Pattern template
- [ ] Template selector UI
- [ ] "Load Template" button
```

**Deliverable:** Persistent workflows with templates

---

### Sprint 6: Backend & Execution (Week 6)

**Goals:** Actually execute graphs with visual feedback

**Tasks:**

```markdown
Day 1-2: Backend Setup
- [ ] Initialize FastAPI project
- [ ] Create execution endpoint
- [ ] Setup WebSocket connection
- [ ] Create Pydantic models

Day 3: Execution Engine
- [ ] Parse workflow JSON
- [ ] Build LangGraph dynamically
- [ ] Execute with streaming
- [ ] Capture state at each step
- [ ] Error handling

Day 4-5: Visual Execution
- [ ] Highlight active node
- [ ] Show execution progress
- [ ] Display state changes
- [ ] Show errors on nodes
- [ ] Execution log panel
```

**Deliverable:** Click "Run" and watch it execute

---

### Sprint 7: UX Polish (Week 7)

**Goals:** Make it feel professional

**Tasks:**

```markdown
Day 1-2: Undo/Redo
- [ ] Implement history stack
- [ ] Undo/redo keyboard shortcuts
- [ ] Undo/redo buttons in toolbar

Day 3: Keyboard Shortcuts
- [ ] Delete selected (Backspace/Delete)
- [ ] Select all (Cmd+A)
- [ ] Copy/paste nodes (Cmd+C/V)
- [ ] Save (Cmd+S)
- [ ] Shortcuts help modal

Day 4: UI Refinements
- [ ] Loading states
- [ ] Empty states
- [ ] Tooltips everywhere
- [ ] Responsive layout
- [ ] Dark mode (optional)

Day 5: Micro-interactions
- [ ] Node hover effects
- [ ] Connection animations
- [ ] Panel transitions
- [ ] Success/error toasts
```

**Deliverable:** Polished, professional feel

---

### Sprint 8: Testing & Documentation (Week 8)

**Goals:** Ship-ready MVP

**Tasks:**

```markdown
Day 1-2: Testing
- [ ] Unit tests for code generator
- [ ] Integration tests for graph operations
- [ ] E2E tests for critical paths
- [ ] Manual testing checklist

Day 3: Documentation
- [ ] README with setup instructions
- [ ] User guide with screenshots
- [ ] API documentation
- [ ] Contributing guide

Day 4-5: Launch Prep
- [ ] Production build
- [ ] Deploy to Vercel/Netlify
- [ ] Backend deploy (Railway/Fly.io)
- [ ] Final bug fixes
- [ ] Create demo video
```

**Deliverable:** MVP Launch! 🚀

---

## 📝 Key Implementation Details

### 1. Graph State Management (Zustand)

```typescript
// stores/graphStore.ts
import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  
  // Actions
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  removeNode: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (node: Node | null) => void;
  loadWorkflow: (workflow: Workflow) => void;
  clear: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),
  
  // ... rest of implementation
}));
```

### 2. Custom Node Component

```typescript
// components/Nodes/LLMNode.tsx
import { Handle, Position, NodeProps } from 'reactflow';

interface LLMNodeData {
  label: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  userPrompt: string;
}

export function LLMNode({ data, selected }: NodeProps<LLMNodeData>) {
  return (
    <div className={`
      px-4 py-3 rounded-lg border-2 bg-white shadow-sm min-w-[180px]
      ${selected ? 'border-orange-500 shadow-orange-100' : 'border-blue-500'}
    `}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-blue-500" 
      />
      
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <div>
          <div className="text-xs text-gray-500 uppercase">LLM</div>
          <div className="font-semibold text-sm">{data.label}</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-1">
        {data.model} • temp: {data.temperature}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-blue-500" 
      />
    </div>
  );
}
```

### 3. Code Generator

```typescript
// services/codeGenerator.ts
import { Node, Edge } from 'reactflow';

export function generateLangGraphCode(
  nodes: Node[], 
  edges: Edge[],
  stateSchema: StateSchema
): string {
  const imports = generateImports(nodes);
  const stateClass = generateStateClass(stateSchema);
  const nodeFunctions = generateNodeFunctions(nodes);
  const graphBuilder = generateGraphBuilder(nodes, edges);
  
  return `${imports}

${stateClass}

${nodeFunctions}

${graphBuilder}
`;
}

function generateImports(nodes: Node[]): string {
  const imports = [
    'from typing import TypedDict, Annotated',
    'from langgraph.graph import StateGraph, START, END',
  ];
  
  if (nodes.some(n => n.type === 'llm')) {
    imports.push('from langchain_openai import ChatOpenAI');
  }
  
  if (nodes.some(n => n.type === 'tool')) {
    imports.push('from langgraph.prebuilt import ToolNode');
  }
  
  return imports.join('\n');
}

// ... more generation functions
```

### 4. Properties Panel Dynamic Form

```typescript
// components/Panels/PropertiesPanel.tsx
import { useGraphStore } from '../../stores/graphStore';

export function PropertiesPanel() {
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const updateNode = useGraphStore((s) => s.updateNode);

  if (!selectedNode) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Select a node to edit properties
      </div>
    );
  }

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'llm':
        return <LLMForm node={selectedNode} onUpdate={updateNode} />;
      case 'tool':
        return <ToolForm node={selectedNode} onUpdate={updateNode} />;
      case 'router':
        return <RouterForm node={selectedNode} onUpdate={updateNode} />;
      default:
        return <BasicForm node={selectedNode} onUpdate={updateNode} />;
    }
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">
        {selectedNode.data.label} Properties
      </h3>
      {renderForm()}
    </div>
  );
}
```

---

## 🚀 Quick Start Commands

```bash
# Initial setup
pnpm create vite apps/web --template react-ts
cd apps/web
pnpm add reactflow zustand @monaco-editor/react
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Development
pnpm dev

# Production build
pnpm build
```

---

## 🧪 Testing Strategy

| Test Type | Tool | Coverage Target |
|-----------|------|-----------------|
| Unit Tests | Vitest | Code generator, utils |
| Component Tests | React Testing Library | Node components |
| Integration | Vitest | Store + components |
| E2E | Playwright | Critical user flows |

**Critical E2E Flows:**
1. Create a simple 3-node graph
2. Configure an LLM node
3. Generate and copy code
4. Save and reload workflow
5. Execute graph (with backend)

---

## 📊 Performance Considerations

| Area | Consideration | Solution |
|------|---------------|----------|
| Large Graphs | Render performance | React Flow virtualization |
| Code Generation | Recalc on every change | Debounce 300ms |
| State Updates | Re-render cascades | Zustand selectors |
| Monaco Editor | Heavy component | Lazy load |

---

## 🔐 Security Notes (for Backend)

- Never execute arbitrary user code directly
- Sandbox execution environment
- Rate limit API calls
- Validate all graph structures
- Don't expose API keys in generated code

---

*Document Version: 1.0*
*Last Updated: January 6, 2026*
