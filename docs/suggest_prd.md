
# Product Requirements Document (PRD)

## Product Name: LangGraph Visual Designer (UI-First)

---

## 1. Purpose & Vision

### 1.1 Problem Statement

LangGraph is powerful but difficult to reason about without writing and running Python code. Existing visual workflow tools (e.g. n8n-style builders) fail to represent **stateful execution, conditional edges, and deterministic transitions**, which are core to LangGraph.

### 1.2 Vision

Build a **browser-based visual modeling environment** where users can:

* Design LangGraph workflows visually
* Understand state transitions clearly
* Simulate graph execution without running code
* Detect logic errors early

The product is **not** a runtime, **not** a code generator (initially), and **not** a deployment tool.

It is a **thinking, modeling, and validation interface for LangGraph systems**.

---

## 2. Goals & Non-Goals

### 2.1 Goals (Phase 1 – UI/UX First)

* Visual authoring of LangGraph workflows
* Explicit global state modeling
* First-class edges with conditional logic
* Step-by-step simulation (no LLM calls)
* Visual validation and risk detection
* Export/import workflow JSON

### 2.2 Non-Goals (Explicitly Out of Scope)

* Python code generation
* Backend execution
* LLM API calls
* Authentication / user accounts
* Cloud deployment
* Version control / collaboration (initially)

---

## 3. Target Users

### Primary Users

* AI Engineers using LangChain/LangGraph
* DevOps / MLOps engineers building agent systems
* Advanced prompt engineers
* Educators teaching agentic workflows

### Secondary Users

* Product engineers exploring agent systems
* Researchers prototyping stateful AI flows

---

## 4. Core User Experience Principles

1. **State before prompts**
2. **Edges explain behavior**
3. **No hidden execution**
4. **Deterministic over magical**
5. **Every mutation is visible**

If a user cannot explain *why* an edge fired, the UI has failed.

---

## 5. Application Layout

### 5.1 Global Layout (Single Page App)

```
Top Bar
-----------------------------------------
Node Palette | Canvas | Properties Panel
-----------------------------------------
State Inspector (Collapsible Drawer)
```

### 5.2 Key Regions

* **Top Bar**: Project actions (Simulate, Validate, Export)
* **Node Palette (Left)**: Drag-and-drop node creation
* **Canvas (Center)**: Graph editing (React Flow)
* **Properties Panel (Right)**: Context-sensitive editor
* **State Inspector (Bottom)**: Global state schema & debugging

---

## 6. Node System

### 6.1 Supported Node Types (Phase 1)

| Category | Node Type  | Description                      |
| -------- | ---------- | -------------------------------- |
| Entry    | Start      | Graph entry point                |
| Logic    | LLM        | Represents an LLM call (UI only) |
| Logic    | Tool       | External tool abstraction        |
| Logic    | Router     | Conditional branching            |
| State    | Reducer    | Controlled state mutation        |
| Flow     | Loop Guard | Loop detection & limits          |
| Exit     | End        | Graph termination                |

### 6.2 Node UX Rules

* Nodes cannot execute independently
* Nodes must declare:

  * State fields they **read**
  * State fields they **write**
* Nodes are invalid until connected correctly
* Invalid connections are visually blocked

---

## 7. Edge System (First-Class Feature)

### 7.1 Edge Types

* Deterministic edge
* Conditional edge
* Loop edge
* Fallback edge

### 7.2 Conditional Edge Editor (UI)

Users define routing rules via structured UI:

```
IF [state.field] [operator] [value] → edge
ELSE → fallback
```

No code, no expressions, no free-text logic.

---

## 8. Global State System

### 8.1 State Schema Editor

Users define a **global shared state** with:

* Field name
* Type (string, number, boolean, object, messages)
* Optional / required
* Read-only vs writable

### 8.2 State Visibility

For each field, the UI must show:

* Nodes that read it
* Nodes that write it
* Potential conflicts (multiple writers)

---

## 9. Properties Panel Behavior

### 9.1 Context-Sensitive Modes

* **No selection** → Project Settings
* **Node selected** → Node Editor
* **Edge selected** → Edge Editor
* **State field selected** → State usage inspector

### 9.2 Node Editor Sections

1. State Inputs (checkbox list)
2. State Outputs (checkbox list)
3. Node-specific configuration (prompt, tool config, etc.)

---

## 10. Simulation Mode (No Runtime)

### 10.1 Purpose

Allow users to **mentally and visually execute** a graph without running code or calling APIs.

### 10.2 Features

* User-provided mock initial state
* Step-by-step execution
* Active node highlighting
* Fired edge highlighting
* State diff viewer (before / after)

### 10.3 Constraints

* No real LLM calls
* No external APIs
* Deterministic simulation only

---

## 11. Validation & Risk Detection

### 11.1 Validation Rules

* Unreachable nodes
* Missing fallback edges
* State fields written by multiple nodes
* Infinite loop risk
* Router without default path

### 11.2 Visual Indicators

* 🔴 Critical (graph may break)
* 🟠 Warning (logic risk)
* 🔵 Informational
* ⚠ Configuration issue

---

## 12. Data Model (UI-Only)

```ts
Workflow {
  id
  metadata
  stateSchema
  nodes[]
  edges[]
}

Node {
  id
  type
  reads[]
  writes[]
  config
}

Edge {
  id
  source
  target
  conditions[]
  isFallback
}
```

This model must be serializable to JSON.

---

## 13. Export / Import

### 13.1 Export

* Workflow JSON
* UI metadata included
* No generated code

### 13.2 Import

* Restore full canvas state
* Restore validation markers
* Restore simulation data (optional)

---

## 14. MVP Definition

### Must Have

* Canvas with nodes & edges
* Global state editor
* Properties panel
* Simulation mode
* Validation warnings
* JSON export/import

### Nice to Have

* Keyboard shortcuts
* Canvas minimap
* Node grouping
* Dark mode

---

## 15. Future Phases (Not in Scope)

* Python code generation
* Backend execution (FastAPI)
* Live LLM execution
* Collaboration / versioning
* Deployment targets

---

## 16. Success Metrics

* Users can explain graph behavior without code
* Users detect logic bugs before execution
* Reduced LangGraph learning curve
* Graphs remain readable beyond 10+ nodes

---

## 17. Summary

This product is **not a low-code toy**.
It is a **state-aware, deterministic modeling environment** for LangGraph systems.

If successful, it becomes:

> “The Figma for agentic workflows.”
