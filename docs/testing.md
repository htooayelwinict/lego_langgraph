# Testing

## Unit Tests (Vitest)

### Running Tests

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:ui       # Vitest UI
```

### Test Structure

```
tests/unit/
├── stores/           # Zustand store tests
├── models/           # Data model tests
├── services/         # Service layer tests
├── features/         # Component tests
└── io/               # Import/export tests
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGraphStore } from '@/store/graphStore';

describe('graphStore', () => {
  beforeEach(() => {
    useGraphStore.getState().clearGraph();
  });

  it('adds nodes correctly', () => {
    useGraphStore.getState().addNode('Start', { x: 0, y: 0 });
    expect(useGraphStore.getState().nodes).toHaveLength(1);
  });
});
```

### Coverage Goal

Target: >80% coverage for core services and stores.

## E2E Tests (Playwright)

### Running Tests

```bash
npm run test:e2e:install  # Install browsers (first time only)
npm run test:e2e          # Run all tests
npm run test:e2e:ui       # Playwright UI mode
```

### Test Structure

```
tests/e2e/
├── app.spec.ts         # App shell smoke test
├── canvas.spec.ts      # Canvas interactions
├── simulation.spec.ts  # Simulation flows
└── import-export.spec.ts # I/O operations
```

### Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test('creates and connects nodes', async ({ page }) => {
  await page.goto('/');

  await page.dragAndDrop('[data-node-type="Start"]', '.react-flow');
  await page.dragAndDrop('[data-node-type="LLM"]', '.react-flow');

  // Connect nodes (implementation depends on your UI)
  const edgeCount = await page.locator('.react-flow__edge').count();
  expect(edgeCount).toBe(1);
});
```

## Test Conventions

1. **Arrange-Act-Assert** — Clear test structure
2. **Descriptive names** — Test names should read like documentation
3. **Isolation** — Each test should be independent
4. **Mock external deps** — localStorage, fetch, etc.
5. **Clean up** — Reset store state in `beforeEach`
