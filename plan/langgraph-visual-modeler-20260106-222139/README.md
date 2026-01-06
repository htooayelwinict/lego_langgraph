# Plan: LangGraph Visual Modeler

**Created:** 2026-01-06
**Status:** ✅ Complete — All 5 Phases Done
**Released:** 2026-01-07 — v1.0.0
**Based on:** `plan/research-implementation-alignment-20250106.md`

## Summary

A deterministic, explainable visual modeling environment for LangGraph applications. The tool enables users to design, simulate, and understand LangGraph workflows through an interactive canvas with state-first design principles—no backend execution required.

## Goals

- [x] Visual canvas with 7 node types (Start, LLM, Tool, Router, Reducer, Loop Guard, End)
- [x] Global state schema editor with validation
- [x] Deterministic step-by-step simulation with edge firing explanations
- [x] LangGraph Lens overlay for conceptual understanding
- [x] Template gallery with 5 canonical examples
- [x] Export/Import JSON for portability

## Progress

- [x] Phase 1: Foundation + Canvas ✅
- [x] Phase 2: State Schema ✅
- [x] Phase 3: Simulation Engine ✅
- [x] Phase 4: Lens + Templates ✅
- [x] Phase 5: QA + Polish ✅

## Scope

### In Scope

- React + TypeScript + Vite frontend
- React Flow for node-edge canvas
- Zustand for state management
- LocalStorage/IndexedDB persistence
- Deterministic simulation (no LLM calls)
- JSON schema for graphs/state
- 3-5 canonical templates (ReAct, Router, Tool Loop)

### Out of Scope

- Backend execution engine
- Real LLM API calls
- User authentication
- Cloud sync/sharing
- Python integration (deferred)
- AI-assisted suggestions (deferred)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Simulation ambiguity with conditional edges | Med | Define deterministic ordering; show rules in UI |
| Complex node configs not captured | Med | Versioned JSON schema; validation on import |
| React Flow performance on large graphs | Med | Memoized renderers; virtualize panels |
| Lens overlay confusing users | Low | Optional toggle; onboarding tooltips |
| State schema editor inconsistency | High | Single source of truth; validate on edit |

## Phases Overview

| Phase | Description | Key Deliverables |
|-------|-------------|------------------|
| 1 | Foundation + Canvas | Vite + React Flow scaffold, node types, edges, JSON I/O |
| 2 | State Schema | Global state panel, field editor, validation |
| 3 | Simulation Engine | Step controls, trace list, edge explanations |
| 4 | Lens + Gallery | Conceptual overlay, template gallery, polish |
| 5 | QA + Polish | Performance tuning, docs, bug fixes |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Canvas | React Flow |
| State | Zustand |
| Storage | LocalStorage/IndexedDB |
| Validation | Client-side rule engine |

## Files to Create

```
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   └── layout/
├── features/
│   ├── canvas/
│   ├── state/
│   ├── sim/
│   ├── lens/
│   ├── gallery/
│   └── io/
├── models/
│   ├── graph.ts
│   ├── state.ts
│   └── simulation.ts
├── store/
├── services/
├── components/
└── utils/
```

## Success Criteria

From PRD: *"If a user cannot explain why an edge fired, the UI has failed"*

- Users can explain graph behavior without Python code
- Users detect logic bugs before execution
- Graphs remain readable at 10+ nodes
- Simulation is deterministic and repeatable
