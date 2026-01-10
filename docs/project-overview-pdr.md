# Project Overview & PDR

## Product Vision

A deterministic, explainable visual modeling environment for LangGraph applications. Design node-edge graphs on a canvas, define state schemas, and simulate execution step-by-step—no backend required.

## Business Goals

- Lower barrier to learning LangGraph through visual, step-by-step simulation
- Provide frontend-only sandbox for validating graph logic before backend integration
- Deliver explainability for every execution step and edge decision
- Offer reusable templates for common LangGraph patterns

## Target Users

- LangGraph learners and educators
- Developers prototyping agent workflows
- Teams needing visual validation of control flow and state transitions

## User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-001 | LangGraph learner | Step through execution | Understand state flow |
| US-002 | Developer | Validate graph structure | Avoid backend errors |
| US-003 | User | See edge explanations | Debug conditions |
| US-004 | Beginner | Load template examples | Learn patterns |

## Features

| Feature | Status | Priority |
|---------|--------|----------|
| Visual Canvas (7 node types) | Done | P0 |
| State Schema Editor | Done | P0 |
| Simulation Engine + Trace | Done | P0 |
| Lens Overlay | Done | P0 |
| Template Gallery | Done | P0 |
| Import/Export JSON | Done | P0 |
| State Flow Visualization | Partial | P1 |
| Quick-Add Interactions | Partial | P1 |
| Pattern Linting | Not Started | P2 |
| AI Suggestions | Not Started | P2 |

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (dev server, build)
- React Flow (canvas)
- Zustand (state)

**Testing**
- Vitest (unit)
- Playwright (E2E)

**Storage**
- localStorage with auto-save

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Success Metrics

- Time to first valid graph: <5 min
- Simulation determinism: 100% repeatability
- Explainability coverage: every edge decision explained
- Template usage: >50% of new graphs start from template
