# Code Standards

## General Principles

1. Follow existing patterns in the codebase
2. Keep functions/methods focused and small
3. Write self-documenting code with clear naming
4. Add comments only when intent isn't obvious

## TypeScript

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `PascalCase.tsx` | `CanvasView.tsx` |
| Utilities | `camelCase.ts` | `stateDiffUtils.ts` |
| Stores | `camelCaseStore.ts` | `graphStore.ts` |
| Hooks | `camelCase` with `use` prefix | `useGraphStore()` |
| Types/Interfaces | `PascalCase` | `GraphModel`, `StateField` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_STEPS` |

### File Organization

- App shell: `src/app/`
- Feature modules: `src/features/{domain}/`
- Models: `src/models/`
- Stores: `src/store/`
- Services: `src/services/`
- Shared UI: `src/components/`

### Export Style

- Prefer named exports for utilities, stores, services
- Default exports for React components
- Feature modules use `index.ts` barrel exports

```typescript
// Named export (stores, services, utilities)
export const useGraphStore = create<GraphStore>((set) => {...});

// Default export (components)
export default function CanvasView() {...}

// Barrel export
export * from './CanvasView';
export * from './NodePalette';
```

## React Components

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { useGraphStore } from '@/store/graphStore';

// 2. Types (if needed)
interface MyComponentProps {
  foo: string;
}

// 3. Component
export default function MyComponent({ foo }: MyComponentProps) {
  // Hooks
  const nodes = useGraphStore(useShallow(s => s.nodes));

  // Handlers
  const handleClick = () => {...};

  // Render
  return <div>...</div>;
}
```

### Styling

- Global styles in [`src/app/index.css`](src/app/index.css)
- CSS variables for theming
- Tailwind-style utility classes preferred
- Component-scoped styles via `<style>` when needed

## Zustand Stores

### Store Pattern

```typescript
interface GraphStore {
  // State
  nodes: Node[];
  edges: Edge[];

  // Actions
  addNode: (type: NodeType) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],

  // Actions
  addNode: (type) => set((state) => ({
    nodes: [...state.nodes, createNode(type)]
  })),
}));
```

### Persistence

- Use `subscribe()` for localStorage persistence
- Handle size limits (4MB quota)
- Show toast on storage errors

## Services

### Service Pattern

```typescript
export class SimulationEngine {
  constructor(
    private graph: GraphModel,
    private options: SimulationOptions
  ) {}

  run(): ExecutionTrace {
    // Implementation
  }
}
```

- Pure functions where possible
- No side effects in constructors
- Clear input/output contracts

## Testing

### Unit Tests (Vitest)

**Structure**: Arrange-Act-Assert

```typescript
describe('graphStore', () => {
  beforeEach(() => {
    useGraphStore.getState().clearGraph();
  });

  it('should add node', () => {
    // Arrange
    const store = useGraphStore.getState();

    // Act
    store.addNode('LLM', { x: 0, y: 0 });

    // Assert
    expect(useGraphStore.getState().nodes).toHaveLength(1);
  });
});
```

**Reset store state** in `beforeEach`:
```typescript
beforeEach(() => {
  useGraphStore.getState().clearGraph();
  useStateStore.getState().clearFields();
});
```

### E2E Tests (Playwright)

```typescript
test('user can create and connect nodes', async ({ page }) => {
  await page.goto('/');

  // Drag node to canvas
  await page.dragAndFind('.node-palette-item', '.react-flow');

  // Assert node exists
  await expect(page.locator('.react-flow-node')).toHaveCount(1);
});
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run types` | TypeScript check only |
| `npm run lint` | ESLint |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Vitest UI |
| `npm run test:e2e` | Playwright E2E |

## Path Aliases

`@/*` → `src/*` (configured in [`vite.config.ts`](vite.config.ts) and [`tsconfig.json`](tsconfig.json))

```typescript
import { useGraphStore } from '@/store/graphStore';
```

## Conventional Commits

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code change without functional change
- `test:` - Adding/updating tests
- `docs:` - Documentation
- `chore:` - Build/config/dependency

## ESLint Rules

Strict mode enabled:
- `noUncheckedIndexedAccess`
- `noUnusedLocals`
- `noUnusedParameters`
- `noImplicitReturns`

Run `npm run lint` before committing.
