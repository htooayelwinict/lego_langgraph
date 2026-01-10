# LangGraph Visual Modeler

A deterministic, explainable visual modeling environment for LangGraph applications. Build graphs with React Flow, define state schemas, and simulate execution without a backend.

## Features

- **Visual Canvas** — React Flow canvas with 7 node types (Start, LLM, Tool, Router, Reducer, LoopGuard, End)
- **State Schema Editor** — Define typed state fields with validation
- **Simulation Engine** — Deterministic step-by-step execution with edge firing explanations
- **Lens Overlay** — Conceptual annotations for understanding LangGraph patterns
- **Template Gallery** — Pre-built canonical examples (ReAct, Router, Tool Loop)
- **Import/Export** — JSON portability and localStorage persistence

## Documentation

| Doc | Description |
|-----|-------------|
| [Project Overview & PDR](docs/project-overview-pdr.md) | Goals, features, user stories |
| [Codebase Summary](docs/codebase-summary.md) | File structure and key files |
| [Code Standards](docs/code-standards.md) | Conventions and patterns |
| [Architecture](docs/architecture.md) | Tech stack, data flow, stores, services |
| [Testing](docs/testing.md) | Unit and E2E test conventions |
| [Contributing](docs/contributing.md) | Setup, workflow, code style |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build |
| `npm run types` | TypeScript type check only |
| `npm run lint` | ESLint |

## Testing

### Unit Tests (Vitest)

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:ui       # Vitest UI
```

### E2E Tests (Playwright)

```bash
npm run test:e2e:install  # Install browsers
npm run test:e2e          # Run tests
npm run test:e2e:ui       # Playwright UI
```

## Project Layout

```
src/
├── app/               # App root, main entry, layout
├── features/          # UI feature modules
│   ├── canvas/        # React Flow canvas, nodes, edges
│   ├── state/         # State schema editor
│   ├── sim/           # Simulation controls, trace viewer
│   ├── lens/          # LangGraph Lens overlay
│   ├── gallery/       # Template gallery
│   └── io/            # Toolbar, export/import
├── models/            # Core data models (graph, state, simulation)
├── store/             # Zustand stores (graph, state, simulation, ui)
├── services/          # Business logic (simulation engine, validator)
└── components/        # Shared UI components

tests/
├── unit/              # Vitest unit tests
└── e2e/               # Playwright E2E tests
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` / `Backspace` | Delete selected node/edge |

## Node Types

| Type | Description |
|------|-------------|
| **Start** | Entry point of the graph |
| **LLM** | Language model call |
| **Tool** | Tool/function execution |
| **Router** | Conditional branching |
| **Reducer** | State reduction/aggregation |
| **LoopGuard** | Loop detection and prevention |
| **End** | Graph termination |

## Development

```bash
# Type check
npm run types

# Lint
npm run lint

# Full test suite
npm run test:run && npm run test:e2e
```

## License

MIT
